from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth_schema import GoogleLoginRequest, RegisterRequest, LoginRequest
from app.services.auth_service import  AuthServiceUser, AuthServiceGoogle

router = APIRouter()


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    return AuthServiceUser().register(data, db)

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return AuthServiceUser().login(data, db)

@router.post("/google-login")
def google_login(data: GoogleLoginRequest, db: Session = Depends(get_db)):
    return AuthServiceGoogle().login_google(data, db)