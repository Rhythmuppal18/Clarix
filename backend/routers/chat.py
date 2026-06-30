from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from database.connection import get_db
from database.models import User, ChatSession, ChatMessage
from middleware.auth_middleware import get_current_user
from pydantic import BaseModel
from typing import List, Optional
import uuid

router = APIRouter()

class CreateSessionRequest(BaseModel):
    selected_doc_ids: List[str] = []

class UpdateSessionRequest(BaseModel):
    title: Optional[str] = None
    selected_doc_ids: Optional[List[str]] = None

@router.post("/sessions")
async def create_chat_session(
    request: CreateSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        new_session = ChatSession(
            org_id=current_user.org_id,
            user_id=current_user.id,
            title="New Chat",
            selected_doc_ids=request.selected_doc_ids
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        return new_session
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions")
async def list_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(ChatSession).where(
        and_(
            ChatSession.user_id == current_user.id,
            ChatSession.org_id == current_user.org_id
        )
    ).order_by(ChatSession.updated_at.desc())
    
    result = db.execute(stmt)
    sessions = result.scalars().all()
    
    response = []
    for s in sessions:
        # Get message count
        msg_count_stmt = select(ChatMessage).where(ChatMessage.session_id == s.id)
        messages = db.execute(msg_count_stmt).scalars().all()
        
        last_message = ""
        if messages:
            last_message_obj = sorted(messages, key=lambda x: x.created_at)[-1]
            last_message = last_message_obj.content[:80] + ("..." if len(last_message_obj.content) > 80 else "")
            
        response.append({
            "id": s.id,
            "title": s.title,
            "selected_doc_ids": s.selected_doc_ids,
            "created_at": s.created_at,
            "updated_at": s.updated_at,
            "message_count": len(messages),
            "last_message": last_message
        })
        
    return response

@router.get("/sessions/{session_id}")
async def get_chat_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(ChatSession).where(
        and_(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id
        )
    )
    result = db.execute(stmt)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    msgs_stmt = select(ChatMessage).where(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.asc())
    messages = db.execute(msgs_stmt).scalars().all()
    
    return {
        "id": session.id,
        "title": session.title,
        "selected_doc_ids": session.selected_doc_ids,
        "created_at": session.created_at,
        "updated_at": session.updated_at,
        "messages": messages
    }

@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(ChatSession).where(
        and_(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id
        )
    )
    result = db.execute(stmt)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    db.delete(session)
    db.commit()
    
    return {"message": "Session deleted"}

@router.patch("/sessions/{session_id}")
async def update_chat_session(
    session_id: str,
    request: UpdateSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(ChatSession).where(
        and_(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id
        )
    )
    result = db.execute(stmt)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if request.title is not None:
        session.title = request.title
    if request.selected_doc_ids is not None:
        session.selected_doc_ids = request.selected_doc_ids
        
    db.commit()
    db.refresh(session)
    return session