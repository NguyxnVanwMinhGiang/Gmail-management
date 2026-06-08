from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories import admin_repository
from app.schemas.admin_schema import AdminCreate, AdminUpdate, AdminChangePassword
from app.utils.hash_util import hash_password
from app.utils.jwt_util import get_current_admin


def has_management_permission(admin) -> bool:
    permissions = admin.permissions or {}

    if not isinstance(permissions, dict):
        return False

    return permissions.get("management") is True


class AdminService:
    def list_admin(db: Session):
        return admin_repository.get_all_admin(db)

    def create_account_admin(db: Session, data: AdminCreate, token: str):
        current_admin_id = get_current_admin(token)

        checkEmail = admin_repository.find_by_email(db, data.email)
        if checkEmail:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )

        hashed_password = hash_password(data.password)

        admin_repository.create_admin(
            db=db,
            email=data.email,
            password_hash=hashed_password,
            full_name=data.full_name,
            permissions=data.permissions,
            created_by=current_admin_id
        )

        return {
            "message": "Admin created successfully"
        }

    def update_account_admin(db: Session, data: AdminUpdate, token: str):
        current_admin_id = get_current_admin(token)

        target_admin = admin_repository.find_by_id(db, data.admin_id)
        if not target_admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Not found admin"
            )

        is_self = current_admin_id == data.admin_id
        target_has_management = has_management_permission(target_admin)

        # Không được chỉnh admin khác cũng có quyền management
        if target_has_management and not is_self:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không thể chỉnh sửa admin khác có quyền management"
            )

        # Không được tự tắt quyền management của bản thân
        if is_self:
            new_permissions = data.permissions or {}

            if new_permissions.get("management") is not True:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Không thể tắt quyền management của chính mình"
                )

        admin = admin_repository.update_admin(
            db=db,
            admin_id=data.admin_id,
            full_name=data.full_name,
            email=data.email,
            permissions=data.permissions,
            is_active=data.is_active,
            is_verified=data.is_verified,
            updated_by=current_admin_id
        )

        return {
            "message": "Admin updated successfully",
            "admin": admin
        }

    def change_password_admin(db: Session, data: AdminChangePassword, token: str):
        current_admin_id = get_current_admin(token)

        target_admin = admin_repository.find_by_id(db, data.admin_id)
        if not target_admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Not found admin"
            )

        is_self = current_admin_id == data.admin_id
        target_has_management = has_management_permission(target_admin)

        # Không được đổi mật khẩu admin management khác
        if target_has_management and not is_self:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không thể đổi mật khẩu admin khác có quyền management"
            )

        password = hash_password(data.password)

        admin = admin_repository.change_password(
            db=db,
            admin_id=data.admin_id,
            password_hash=password
        )

        return admin

    def delete_account_admin(db: Session, admin_id: int, token: str):
        current_admin_id = get_current_admin(token)

        # Không được xóa chính mình
        if current_admin_id == admin_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể xóa tài khoản của chính mình"
            )

        target_admin = admin_repository.find_by_id(db, admin_id)
        if not target_admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Not found admin"
            )

        # Không được xóa admin khác có quyền management
        if has_management_permission(target_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không thể xóa admin khác có quyền management"
            )

        admin_repository.delete_admin(db=db, admin_id=admin_id)

        return {
            "message": "Delete successfully"
        }