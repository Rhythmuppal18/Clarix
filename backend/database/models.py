import uuid
from sqlalchemy import Column, String, Boolean, Integer, Text, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.types import TIMESTAMP
from database.connection import Base
import enum

class RoleEnum(str, enum.Enum):
    admin = 'admin'
    employee = 'employee'

class DocStatusEnum(str, enum.Enum):
    processing = 'processing'
    ready = 'ready'
    failed = 'failed'

class FileTypeEnum(str, enum.Enum):
    pdf = 'pdf'
    docx = 'docx'
    csv = 'csv'

class Organisation(Base):
    __tablename__ = 'organisations'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, index=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    users = relationship("User", back_populates="organisation", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="organisation", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = 'users'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    org_id = Column(UUID(as_uuid=True), ForeignKey('organisations.id'), nullable=False)
    role = Column(SQLEnum(RoleEnum), default=RoleEnum.employee)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    organisation = relationship("Organisation", back_populates="users")
    uploaded_documents = relationship("Document", back_populates="uploader")

class Document(Base):
    __tablename__ = 'documents'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey('organisations.id'), nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    file_name = Column(String(255))
    file_path = Column(String(500))
    file_type = Column(SQLEnum(FileTypeEnum))
    file_size = Column(Integer)
    chunk_count = Column(Integer, default=0)
    status = Column(SQLEnum(DocStatusEnum), default=DocStatusEnum.processing)
    created_at = Column(TIMESTAMP, server_default=func.now())

    organisation = relationship("Organisation", back_populates="documents")
    uploader = relationship("User", back_populates="uploaded_documents")

class QueryLog(Base):
    __tablename__ = 'query_logs'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey('organisations.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    question = Column(Text)
    answer = Column(Text)
    sources = Column(JSONB)
    created_at = Column(TIMESTAMP, server_default=func.now())

class ChatRoleEnum(str, enum.Enum):
    user = 'user'
    assistant = 'assistant'

class ChatSession(Base):
    __tablename__ = 'chat_sessions'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey('organisations.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    title = Column(String(255))
    selected_doc_ids = Column(JSONB, server_default='[]')
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    organisation = relationship("Organisation")
    user = relationship("User")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = 'chat_messages'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey('chat_sessions.id'), nullable=False)
    role = Column(SQLEnum(ChatRoleEnum), nullable=False)
    content = Column(Text, nullable=False)
    sources = Column(JSONB, server_default='[]')
    created_at = Column(TIMESTAMP, server_default=func.now())

    session = relationship("ChatSession", back_populates="messages")
