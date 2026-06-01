from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth_schema import LoginRequestAdmin, RegisterRequestAdmin
from app.services.auth_service import AuthServiceAdmin
from app.utils.jwt_util import get_current_admin


router = APIRouter()

# @router.post("/login")
# def login_admin(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
#     data = LoginRequestAdmin(
#         email=form_data.username,
#         password=form_data.password
#     )
#     return AuthServiceAdmin().login_admin(data, db)

@router.post("/login")
def login_admin(data: LoginRequestAdmin, db: Session = Depends(get_db)):
    return AuthServiceAdmin().login_admin(data, db)

@router.post("/register")
def register_admin(data: RegisterRequestAdmin, db: Session = Depends(get_db)):
    return AuthServiceAdmin().register_admin(data, db)

@router.post('/checkinfotoken')
def checkinfotoken(authorization: str = Header(..., alias="Authorization")) -> int:
    return get_current_admin(authorization)


