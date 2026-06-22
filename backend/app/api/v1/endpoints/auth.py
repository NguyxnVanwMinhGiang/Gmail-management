from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.auth_schema import GoogleLoginRequest, RegisterRequest, LoginRequest
from app.services.auth_service import  AuthServiceUser, GoogleLoginService
from app.schemas.auth_schema import E2EEKeysUpdate

router = APIRouter()


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    return AuthServiceUser().register(data, db)

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return AuthServiceUser().login(data, db)

@router.post("/google-login")
def google_login(code: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    return  GoogleLoginService().refresh_access_token(code, db)


@router.post("/e2ee-keys")
def save_e2ee_keys(
    keys_data: E2EEKeysUpdate,
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db)
):
    return GoogleLoginService().save_e2ee_keys(keys_data=keys_data, token=authorization, db=db) 

@router.get("/e2ee-keys")
def get_e2ee_keys(
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db)
):
    return GoogleLoginService().get_e2ee_keys(token=authorization, db=db)