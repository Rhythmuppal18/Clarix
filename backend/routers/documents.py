from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
import os
import uuid
from typing import List

from database.connection import get_db
from database.models import User, Document, RoleEnum
from middleware.auth_middleware import get_current_user, require_admin
from models.response_models import DocumentResponse
from services.vector_store import delete_document as delete_vector_document
import cloudinary
import cloudinary.uploader
import cloudinary.api

router = APIRouter(prefix="/documents", tags=["documents"])

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "do9syuotn"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "934141157912738"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

def format_size(size_in_bytes: int) -> str:
    if size_in_bytes is None:
        return "0 B"
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_in_bytes < 1024.0:
            return f"{size_in_bytes:.1f} {unit}"
        size_in_bytes /= 1024.0
    return f"{size_in_bytes:.1f} TB"

@router.get("/list")
def list_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns all documents strictly for the current user's organization.
    """
    stmt = (
        select(Document, User.name.label("uploaded_by_name"))
        .join(User, Document.uploaded_by == User.id)
        .where(Document.org_id == current_user.org_id)
        .order_by(desc(Document.created_at))
    )
    results = db.execute(stmt).all()
    
    response = []
    for doc, uploader_name in results:
        can_delete = current_user.role == RoleEnum.admin or doc.uploaded_by == current_user.id
        response.append({
            "id": str(doc.id),
            "file_name": doc.file_name,
            "file_type": doc.file_type.value if hasattr(doc.file_type, 'value') else doc.file_type,
            "file_size": doc.file_size,
            "file_size_formatted": format_size(doc.file_size),
            "chunk_count": doc.chunk_count,
            "status": doc.status.value if hasattr(doc.status, 'value') else doc.status,
            "uploaded_by_name": uploader_name,
            "uploaded_by_id": str(doc.uploaded_by),
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
            "can_delete": can_delete
        })
    return response

@router.get("/{doc_id}")
def get_document(doc_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Get single document details.
    """
    stmt = (
        select(Document, User.name.label("uploaded_by_name"))
        .join(User, Document.uploaded_by == User.id)
        .where(Document.id == doc_id, Document.org_id == current_user.org_id)
    )
    result = db.execute(stmt).first()
    
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
    doc, uploader_name = result
    can_delete = current_user.role == RoleEnum.admin or doc.uploaded_by == current_user.id
    
    return {
        "id": str(doc.id),
        "file_name": doc.file_name,
        "file_type": doc.file_type.value if hasattr(doc.file_type, 'value') else doc.file_type,
        "file_size": doc.file_size,
        "file_size_formatted": format_size(doc.file_size),
        "chunk_count": doc.chunk_count,
        "status": doc.status.value if hasattr(doc.status, 'value') else doc.status,
        "uploaded_by_name": uploader_name,
        "uploaded_by_id": str(doc.uploaded_by),
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
        "can_delete": can_delete
    }

@router.get("/{doc_id}/status")
def get_document_status(doc_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns current processing status of a document.
    """
    doc = db.execute(select(Document).filter(
        Document.id == doc_id, 
        Document.org_id == current_user.org_id
    )).scalar_one_or_none()
    
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found or permission denied")
        
    return {"doc_id": doc_id, "status": doc.status}

@router.delete("/{doc_id}")
def delete_document(
    doc_id: uuid.UUID, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Deletes document from PostgreSQL, ChromaDB, and the filesystem.
    """
    doc = db.execute(select(Document).filter(
        Document.id == doc_id, 
        Document.org_id == current_user.org_id
    )).scalar_one_or_none()
    
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found or permission denied")
        
    can_delete = current_user.role == RoleEnum.admin or doc.uploaded_by == current_user.id
    if not can_delete:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

    # 1. Delete from file system or Cloudinary
    try:
        if doc.file_path:
            if "cloudinary.com" in doc.file_path:
                # Extract public_id from Cloudinary URL (format varies slightly, basic heuristic)
                # Typical format: http://res.cloudinary.com/cloud_name/raw/upload/v1234/clarix/org_id/doc_id_filename.ext
                # But it's easier to use the exact structure we uploaded: public_id=clarix/{org_id}/{doc_id}_{filename}
                public_id = f"clarix/{doc.org_id}/{doc.id}_{doc.file_name}"
                cloudinary.uploader.destroy(public_id, resource_type="raw")
            elif os.path.exists(doc.file_path):
                os.remove(doc.file_path)
    except Exception as e:
        print(f"Failed to delete file {doc.file_path}: {e}")

    # 2. Delete from ChromaDB Vector Store
    try:
        delete_vector_document(str(current_user.org_id), str(doc_id))
    except Exception as e:
        print(f"Failed to delete chunks from ChromaDB: {e}")

    # 3. Delete from PostgreSQL
    db.delete(doc)
    db.commit()
    
    return {"message": "Document deleted successfully"}
