from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth_schema import RegisterRequest, LoginRequest
from app.services.auth_service import  AuthServiceUser

router = APIRouter()


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    return AuthServiceUser().register(data, db)

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return AuthServiceUser().login(data, db)