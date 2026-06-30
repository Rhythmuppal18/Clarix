from pydantic import BaseModel
from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    role: str
    org_name: str
    org_id: UUID

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class DocumentResponse(BaseModel):
    id: UUID
    file_name: str
    file_type: str
    file_size: int
    chunk_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class SourceBlock(BaseModel):
    filename: str
    chunk_index: int

class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceBlock]
    timestamp: datetime
