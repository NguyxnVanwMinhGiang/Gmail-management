from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.utils.jwt_util import get_current_admin
from app.schemas.admin_schema import AdminCreate, AdminUpdate, AdminChangePassword

from app.services.admin_service import AdminService

router = APIRouter()

@router.get("/")
def get_all_admin(db: Session = Depends(get_db)):
    return AdminService.list_admin(db)

@router.post("/")
def create_admin(data: AdminCreate,token: str, db: Session = Depends(get_db)):
    return AdminService.create_account_admin(db, data, token)

@router.put("/{admin_id}")
def update_account_admin(data: AdminUpdate, token: str, db: Session= Depends(get_db)):
    return AdminService.update_account_admin(db, data, token)

@router.patch("/{admin_id}/pasword")
def change_password_admin(token: str, data: AdminChangePassword, db: Session= Depends(get_db)):
    return AdminService.change_password_admin(db, data, token)

@router.post("/{admin_id}")
def delete_account_admin(admin_id: int, db: Session= Depends(get_db)):
    return AdminService.delete_account_admin(db, admin_id,)