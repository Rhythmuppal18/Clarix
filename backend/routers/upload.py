import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from database.connection import get_db
from database.models import User, Document, DocStatusEnum, FileTypeEnum
from middleware.auth_middleware import get_current_user
from services.document_parser import parse_pdf, parse_docx, parse_csv
from services.chunker import split_text
from services.embedder import encode_texts
from services.vector_store import add_chunks
import cloudinary
import cloudinary.uploader
import cloudinary.api

router = APIRouter(prefix="/documents", tags=["documents"])

MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
UPLOADS_PATH = os.getenv("UPLOADS_PATH", "./uploads")

# Configure cloudinary using URL from .env if present
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "do9syuotn"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "934141157912738"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

def process_document_task(engine, doc_id: uuid.UUID, org_id: uuid.UUID, file_path: str, file_name: str, file_type: FileTypeEnum):
    """
    Background Task:
    1. Parse text
    2. Split into chunks
    3. Generate embeddings
    4. Store in Vector DB
    5. Upload to Cloudinary & update SQL Document Status
    """
    with Session(bind=engine) as db:
        try:
            # 1. Parse text
            text = ""
            if file_type == FileTypeEnum.pdf:
                text = parse_pdf(file_path)
            elif file_type == FileTypeEnum.docx:
                text = parse_docx(file_path)
            elif file_type == FileTypeEnum.csv:
                text = parse_csv(file_path)

            if not text.strip():
                raise ValueError("Extracted text is empty or corrupted")        

            # 2. Split chunks
            chunks = split_text(text)
            if not chunks:
                raise ValueError("No chunks could be generated from the text")  

            # 3. Generate Embeddings in small batches to reduce memory pressure.
            embeddings = encode_texts(chunks)

            # 4. Store in ChromaDB
            metadatas = [
                {"doc_id": str(doc_id), "org_id": str(org_id), "filename": file_name, "chunk_index": idx}
                for idx in range(len(chunks))
            ]
            add_chunks(org_id=str(org_id), chunks=chunks, embeddings=embeddings, metadatas=metadatas)

            # 5. Upload to Cloudinary for permanent storage
            cloudinary_url = file_path
            try:
                # 'raw' resource type supports pdf, docx, csv, etc.
                response = cloudinary.uploader.upload(
                    file_path, 
                    resource_type='raw', 
                    public_id=f"clarix/{org_id}/{doc_id}_{file_name}"
                )
                cloudinary_url = response.get('secure_url')
                # Delete local temp file after upload
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as upload_err:
                print(f"Cloudinary upload failed (fallback to local if persistent storage used): {upload_err}")

            # 6. Update Status
            doc = db.execute(select(Document).filter(Document.id == doc_id)).scalar_one_or_none()
            if doc:
                doc.status = DocStatusEnum.ready
                doc.chunk_count = len(chunks)
                doc.file_path = cloudinary_url  # Update with Cloud URL
        except Exception as e:
            print(f"Error processing doc {doc_id}: {e}")
            doc = db.execute(select(Document).filter(Document.id == doc_id)).scalar_one_or_none()
            if doc:
                doc.status = DocStatusEnum.failed
                db.commit()

@router.post("/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file name")

    file_ext = file.filename.split(".")[-1].lower()
    
    if file_ext == "pdf":
        file_type = FileTypeEnum.pdf
    elif file_ext == "docx":
        file_type = FileTypeEnum.docx
    elif file_ext == "csv":
        file_type = FileTypeEnum.csv
    else:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Unsupported file type. Allowed: pdf, docx, csv")

    org_upload_dir = os.path.join(UPLOADS_PATH, str(current_user.org_id))
    os.makedirs(org_upload_dir, exist_ok=True)
    
    doc_id = uuid.uuid4()
    saved_filename = f"{doc_id}_{file.filename}"
    file_path = os.path.join(org_upload_dir, saved_filename)
    
    # Securely stream the uploaded file to disk to prevent OOM issues
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size_bytes = os.path.getsize(file_path)
    file_size_mb = file_size_bytes / (1024 * 1024)
    
    if file_size_bytes == 0:
        os.remove(file_path)  # Cleanup
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file content")
        
    if file_size_mb > MAX_FILE_SIZE_MB:
        os.remove(file_path)  # Cleanup
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_MB}MB")
        
    document = Document(
        id=doc_id,
        org_id=current_user.org_id,
        uploaded_by=current_user.id,
        file_name=file.filename,
        file_path=file_path,
        file_type=file_type,
        file_size=file_size_bytes,
        status=DocStatusEnum.processing
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    
    background_tasks.add_task(
        process_document_task,
        engine=db.get_bind(), # Pass the engine to avoid connection leaks
        doc_id=doc_id,
        org_id=current_user.org_id,
        file_path=file_path,
        file_name=file.filename,
        file_type=file_type
    )
    
    return {
        "doc_id": doc_id,
        "status": "processing",
        "detail": "File uploaded successfully and processing started in the background"
    }
