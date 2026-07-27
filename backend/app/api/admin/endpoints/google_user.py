from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories import google_repository
from app.schemas.user_schema import UserGGResponse, UserStatusUpdate
from app.utils.jwt_util import get_current_admin
from app.services.admin_service.user_service import UserService

service = UserService()
router = APIRouter()


def get_authorization_header(authorization: str = Header(..., alias="Authorization")) -> str:
    return authorization


@router.get("/")
def list_google_users(
    db: Session = Depends(get_db),
    authorization: str = Depends(get_authorization_header),
):
    payload = get_current_admin(authorization)
    permissions = payload.get("permissions") or {}
    if permissions.get("management") is not True:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    users = db.query(google_repository.Users_gg).order_by(google_repository.Users_gg.id.asc()).all()
    return [UserGGResponse.model_validate(user) for user in users]

@router.patch("/{user_id}")
def update_user_status(
    user_id: int,
    data: UserStatusUpdate,
    db: Session = Depends(get_db),
    authorization: str = Depends(get_authorization_header),
):
    return service.update_user_status(db, user_id, data, authorization)
