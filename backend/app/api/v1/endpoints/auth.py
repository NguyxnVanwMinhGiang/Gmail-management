from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.auth_schema import GoogleLoginRequest, RegisterRequest, LoginRequest
from app.services.auth_service import  AuthServiceUser, E2EEKeyService, GoogleLoginService, Me
from app.schemas.auth_schema import E2EEKeysUpdate

from app.middlewares.rate_limit_middleware import limiter

router = APIRouter()


@router.post("/register")
@limiter.limit("10/second")
def register(request: Request, data: RegisterRequest, db: Session = Depends(get_db)):
    return AuthServiceUser().register(data, db)

@router.post("/login")
@limiter.limit("10/second")
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    return AuthServiceUser().login(data, db)

@router.post("/google-login")
@limiter.limit("10/second")
def google_login(request: Request, code: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    return  GoogleLoginService().refresh_access_token(code, db)

@router.get("/me")
@limiter.limit("10/second")
def get_info_me(
    request: Request,
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db)
):
    return Me().get_info_me(token=authorization, db=db)

@router.post("/e2ee-keys")
@limiter.limit("10/second")
def save_e2ee_keys(
    request: Request,
    keys_data: E2EEKeysUpdate,
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db)
):
    return E2EEKeyService().save_e2ee_keys(keys_data=keys_data, token=authorization, db=db) 

@router.get("/e2ee-keys")
@limiter.limit("10/second")
def get_e2ee_keys(
    request: Request,
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db)
):
    return E2EEKeyService().get_e2ee_keys(token=authorization, db=db)