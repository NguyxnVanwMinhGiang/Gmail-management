from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.user_schema import UserStatusUpdate
from app.services.admin_service.user_service import UserService

router = APIRouter()
service = UserService()


def get_authorization_header(authorization: str = Header(..., alias="Authorization")) -> str:
    return authorization


@router.get("/")
def list_users(
    db: Session = Depends(get_db),
    authorization: str = Depends(get_authorization_header),
):
    return service.list_users(db, authorization)


@router.patch("/{user_id}")
def update_user_status(
    user_id: int,
    data: UserStatusUpdate,
    db: Session = Depends(get_db),
    authorization: str = Depends(get_authorization_header),
):
    return service.update_user_status(db, user_id, data, authorization)
