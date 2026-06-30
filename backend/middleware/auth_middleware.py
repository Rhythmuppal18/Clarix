import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import select
from jose import JWTError
from uuid import UUID

from database.connection import get_db
from database.models import User, RoleEnum
from services.auth_service import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    Validates the JWT token, extracts the user_id (sub) and org_id,
    and returns the fully populated User object from the database.
    This ensures org_id is always securely extracted from the token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        org_id: str = payload.get("org_id")
        if user_id is None or org_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.execute(select(User).filter(User.id == UUID(user_id))).scalar_one_or_none()
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")
        
    # Security check: Ensure token org_id matches database org_id
    if str(user.org_id) != org_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Organization ID mismatch in token")
        
    return user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency that ensures the current user has the 'admin' role.
    """
    if current_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Insufficient permissions. Admin role required."
        )
    return current_user
