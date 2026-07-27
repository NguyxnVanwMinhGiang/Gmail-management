from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories import user_repository, google_repository
from app.schemas.user_schema import UserResponse, UserStatusUpdate, UserStatusResponse, GoogleUserResponse
from app.utils.jwt_util import get_current_admin


class UserService:
    def __init__(self):
        self.user_repository = user_repository
        self.google_repository = google_repository

    @staticmethod
    def _ensure_admin(token: str):
        payload = get_current_admin(token)
        permissions = payload.get("permissions") or {}
        if permissions.get("management") is not True:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return payload

    def list_users(self, db: Session, token: str) -> list[UserResponse]:
        self._ensure_admin(token)
        users = self.user_repository.get_all_users(db)
        return [UserResponse.model_validate(user) for user in users]

    def update_user_status(self, db: Session, user_id: int, data: UserStatusUpdate, token: str) -> UserStatusResponse:
        self._ensure_admin(token)

        user = self.user_repository.update_user_status(
            db,
            user_id,
            is_active=data.is_active,
            vip=data.vip,
        )
        user_google_account = self.google_repository.get_google_account_by_user_id(db, user_id)

        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found user")

        return UserStatusResponse(
            **UserResponse.model_validate(user).model_dump(),
            user_gg=GoogleUserResponse.model_validate(user_google_account) if user_google_account else None,
        )
