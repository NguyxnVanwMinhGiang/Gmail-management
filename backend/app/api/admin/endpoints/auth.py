from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
# Đảm bảo đã import LoginRequestAdmin
from app.schemas.auth_schema import LoginRequestAdmin, RegisterRequestAdmin
from app.services.auth_service import AuthServiceAdmin

router = APIRouter()

@router.post("/login")
def login_admin(data: LoginRequestAdmin, db: Session = Depends(get_db)):
    # Trích xuất email và password từ Pydantic schema (data) để truyền vào service
    return AuthServiceAdmin().login_admin(email=data.email, password=data.password, db=db)

@router.post("/register")
def register_admin(
    data: RegisterRequestAdmin,
    db: Session = Depends(get_db),
    authorization: str = Header(..., alias="Authorization"),
):
    return AuthServiceAdmin().register_admin(db, authorization, data)

# @router.post('/checkinfotoken')
# def checkinfotoken(authorization: str = Header(..., alias="Authorization")) -> int:
#     return get_current_admin(authorization)

