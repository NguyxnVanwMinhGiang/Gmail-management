from fastapi import APIRouter, Depends, HTTPException, status, Header
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
def create_admin(data: AdminCreate, authorization: str = Header(..., alias="Authorization"), db: Session = Depends(get_db)):
    return AdminService.create_account_admin(db, data, authorization)

@router.put("/{admin_id}")
def update_account_admin(admin_id: int, data: AdminUpdate, authorization: str = Header(..., alias="Authorization"), db: Session = Depends(get_db)):
    if data.admin_id != admin_id:
        data.admin_id = admin_id
    return AdminService.update_account_admin(db, data, authorization)

@router.patch("/{admin_id}/password")
def change_password_admin(admin_id: int, data: AdminChangePassword, authorization: str = Header(..., alias="Authorization"), db: Session= Depends(get_db)):
    if data.admin_id != admin_id:
        data.admin_id = admin_id
    return AdminService.change_password_admin(db, data, authorization)

@router.delete("/{admin_id}")
def delete_account_admin(admin_id: int, db: Session= Depends(get_db)):
    return AdminService.delete_account_admin(db, admin_id,)