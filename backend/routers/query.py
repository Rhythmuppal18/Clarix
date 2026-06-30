from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from slowapi import Limiter
from slowapi.util import get_remote_address
from datetime import datetime
import uuid
import os
from pydantic import BaseModel
from typing import List, Optional

from database.connection import get_db
from database.models import User, Document, QueryLog, DocStatusEnum, ChatSession, ChatMessage, ChatRoleEnum
from middleware.auth_middleware import get_current_user
from services.embedder import encode_texts
from services.vector_store import query_chunks_scoped
from services.llm_service import call_gemini

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/query", tags=["query"])

class QueryRequestWithSession(BaseModel):
    question: str
    session_id: str
    selected_doc_ids: Optional[List[str]] = []

@router.post("")
@limiter.limit("10/minute")
def query_documents(
    request: Request, 
    query: QueryRequestWithSession, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if len(query.question.strip()) < 3:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question too short")

    org_id = current_user.org_id
    
    # Verify session exists and belongs to user
    stmt = select(ChatSession).where(
        and_(
            ChatSession.id == query.session_id,
            ChatSession.user_id == current_user.id
        )
    )
    session = db.execute(stmt).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    try:
        query_embedding = encode_texts([query.question])[0]
    except Exception as e:
        print(f"Embedding error: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Embedding service unavailable: {e}")

    try:
        top_k = int(os.getenv("TOP_K_RESULTS", "5"))
        # Call new scoped query function
        results = query_chunks_scoped(
            org_id=str(org_id),
            question_embedding=query_embedding,
            selected_doc_ids=query.selected_doc_ids,
            top_k=top_k
        )
    except Exception as e:
        print(f"DB search error: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Database service unavailable: {e}")

    retrieved_chunks = []
    if results and results.get('documents') and results['documents'][0]:
        for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
            retrieved_chunks.append({
                "text": doc,
                "filename": meta.get("filename"),
                "chunk_index": meta.get("chunk_index"),
                "doc_id": meta.get("doc_id")
            })

    if not retrieved_chunks:
        answer = "I could not find this information in your organisation's documents."
        sources = []
    else:
        try:
            answer = call_gemini(retrieved_chunks, query.question)
        except Exception as e:
            print(f"Gemini error: {e}")
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Google Gemini API unreachable: {e}")
        sources = [
            {"filename": chunk.get("filename", "Unknown"), "chunk_index": chunk.get("chunk_index", 0)}
            for chunk in retrieved_chunks
        ]
        
    # Create user message
    user_msg = ChatMessage(
        session_id=session.id,
        role=ChatRoleEnum.user,
        content=query.question
    )
    db.add(user_msg)
    
    # Create assistant message
    asst_msg = ChatMessage(
        session_id=session.id,
        role=ChatRoleEnum.assistant,
        content=answer,
        sources=sources
    )
    db.add(asst_msg)
    
    # Update Session
    session.updated_at = datetime.utcnow()
    if session.title == "New Chat":
        session.title = query.question[:60]
    
    db.commit()
    
    return {
        "answer": answer,
        "sources": sources,
        "timestamp": datetime.utcnow().isoformat(),
        "session_id": str(session.id)
    }


@router.get("/history")
def get_query_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logs = db.execute(select(QueryLog).filter(QueryLog.org_id == current_user.org_id).order_by(QueryLog.created_at.desc())).scalars().all()
    return [
        {
            "id": log.id,
            "question": log.question,
            "answer": log.answer,
            "sources": log.sources,
            "created_at": log.created_at
        } 
        for log in logs
    ]
