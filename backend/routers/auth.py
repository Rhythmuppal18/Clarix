from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from database.connection import get_db
from database.models import User, Organisation, RoleEnum
from models.request_models import OrgRegisterRequest, EmployeeRegisterRequest, LoginRequest
from models.response_models import TokenResponse, UserResponse
from services.auth_service import hash_password, verify_password, create_access_token, normalize_email
from middleware.auth_middleware import get_current_user
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register-org", response_model=TokenResponse)
def register_org(request: OrgRegisterRequest, db: Session = Depends(get_db)):
    normalized_email = normalize_email(str(request.admin_email))
    if db.execute(select(User).filter(func.lower(User.email) == normalized_email)).scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    org_id = uuid.uuid4()
    slug = f"{request.org_name.lower().replace(' ', '-')}-{str(uuid.uuid4())[:8]}"
    org = Organisation(id=org_id, name=request.org_name, slug=slug)
    db.add(org)
    
    user = User(
        name=request.admin_name,
        email=normalized_email,
        password=hash_password(request.password),
        org_id=org_id,
        role=RoleEnum.admin
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.refresh(org)
    
    token = create_access_token(
        data={"sub": str(user.id), "org_id": str(org.id), "role": user.role.value}
    )
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value,
            "org_name": org.name,
            "org_id": org.id
        }
    }

@router.post("/register-employee", response_model=TokenResponse)
def register_employee(request: EmployeeRegisterRequest, db: Session = Depends(get_db)):
    normalized_email = normalize_email(str(request.email))
    org = db.execute(select(Organisation).filter(Organisation.id == request.org_id)).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organisation not found")
        
    if db.execute(select(User).filter(func.lower(User.email) == normalized_email)).scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        
    user = User(
        name=request.name,
        email=normalized_email,
        password=hash_password(request.password),
        org_id=request.org_id,
        role=RoleEnum.employee
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token(
        data={"sub": str(user.id), "org_id": str(user.org_id), "role": user.role.value}
    )
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value,
            "org_name": org.name,
            "org_id": user.org_id
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    normalized_email = normalize_email(str(request.email))
    user = db.execute(select(User).filter(func.lower(User.email) == normalized_email)).scalar_one_or_none()
    if not user or not verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    org = db.execute(select(Organisation).filter(Organisation.id == user.org_id)).scalar_one_or_none()
        
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")
        
    token = create_access_token(
        data={"sub": str(user.id), "org_id": str(user.org_id), "role": user.role.value}
    )
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value,
            "org_name": org.name,
            "org_id": user.org_id
        }
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org = db.execute(select(Organisation).filter(Organisation.id == current_user.org_id)).scalar_one_or_none()
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role.value,
        "org_name": org.name,
        "org_id": current_user.org_id
    }
