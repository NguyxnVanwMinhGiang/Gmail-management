from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.admin_schema import AdminCreate, AdminUpdate, AdminChangePassword
from app.services.admin_service.admin_service import AdminService

router = APIRouter()
service = AdminService()


def get_authorization_header(authorization: str = Header(..., alias="Authorization")) -> str:
    return authorization


@router.get("/")
def get_all_admin(
    db: Session = Depends(get_db),
    authorization: str = Depends(get_authorization_header),
):
    return service.list_admin(db, authorization)


@router.post("/")
def create_admin(
    data: AdminCreate,
    db: Session = Depends(get_db),
    authorization: str = Depends(get_authorization_header),
):
    return service.create_account_admin(db, data, authorization)


@router.put("/{admin_id}")
def update_account_admin(
    admin_id: int,
    data: AdminUpdate,
    db: Session = Depends(get_db),
    authorization: str = Depends(get_authorization_header),
):
    data.admin_id = admin_id
    return service.update_account_admin(db, data, authorization)


@router.patch("/{admin_id}/password")
def change_password_admin(
    admin_id: int,
    data: AdminChangePassword,
    db: Session = Depends(get_db),
    authorization: str = Depends(get_authorization_header),
):
    data.admin_id = admin_id
    return service.change_password_admin(db, data, authorization)


@router.delete("/{admin_id}")
def delete_account_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    authorization: str = Depends(get_authorization_header),
):
    return service.delete_account_admin(db, admin_id, authorization)
