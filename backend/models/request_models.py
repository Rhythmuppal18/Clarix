from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID

class OrgRegisterRequest(BaseModel):
    org_name: str
    admin_name: str
    admin_email: EmailStr
    password: str = Field(min_length=6)

class EmployeeRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    org_id: UUID

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class QueryRequest(BaseModel):
    question: str = Field(min_length=3, max_length=400)
