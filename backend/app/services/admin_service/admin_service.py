from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories import admin_repository
from app.schemas.admin_schema import AdminCreate, AdminUpdate, AdminChangePassword
from app.utils.hash_util import hash_password
from app.utils.jwt_util import get_current_admin


def _extract_admin_context(token: str):
    payload = get_current_admin(token)
    permissions = payload.get("permissions") or {}
    if payload.get("role") != "admin" or permissions.get("management") is not True:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return payload


def has_management_permission(admin) -> bool:
    permissions = admin.permissions or {}
    return isinstance(permissions, dict) and permissions.get("management") is True


def _admin_to_dict(admin):
    return {
        "id": admin.id,
        "email": admin.email,
        "full_name": admin.full_name,
        "role": admin.role,
        "permissions": admin.permissions or {},
        "is_active": admin.is_active,
        "is_verified": admin.is_verified,
        "is_2fa_enabled": admin.is_2fa_enabled,
        "created_by": admin.created_by,
        "updated_by": admin.updated_by,
        "created_at": admin.created_at,
        "updated_at": admin.updated_at,
    }


class AdminService:
    def __init__(self):
        self.admin_repository = admin_repository

    def list_admin(self, db: Session, token: str):
        _extract_admin_context(token)
        admins = self.admin_repository.get_all_admin(db)
        return [_admin_to_dict(admin) for admin in admins if has_management_permission(admin)]

    def create_account_admin(self, db: Session, data: AdminCreate, token: str):
        current_admin = _extract_admin_context(token)
        check_email = self.admin_repository.find_admin_by_email(db, data.email)
        if check_email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

        hashed_password = hash_password(data.password)
        admin = self.admin_repository.create_admin(
            db=db,
            email=data.email,
            password_hash=hashed_password,
            full_name=data.full_name,
            permissions=data.permissions,
            created_by=current_admin["admin_id"],
        )
        return {"message": "Admin created successfully", "admin": _admin_to_dict(admin)}

    def update_account_admin(self, db: Session, data: AdminUpdate, token: str):
        current_admin = _extract_admin_context(token)
        target_admin = self.admin_repository.get_admin_by_id(db, data.admin_id)
        if not target_admin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found admin")

        is_self = current_admin["admin_id"] == data.admin_id
        if has_management_permission(target_admin) and not is_self:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không thể chỉnh sửa admin khác có quyền management")

        if is_self:
            new_permissions = data.permissions or target_admin.permissions or {}
            if new_permissions.get("management") is not True:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không thể tắt quyền management của chính mình")

        admin = self.admin_repository.update_admin(
            db=db,
            admin_id=data.admin_id,
            full_name=data.full_name,
            email=data.email,
            permissions=data.permissions,
            is_active=data.is_active,
            is_verified=data.is_verified,
            updated_by=current_admin["admin_id"],
        )
        return {"message": "Admin updated successfully", "admin": _admin_to_dict(admin)}

    def change_password_admin(self, db: Session, data: AdminChangePassword, token: str):
        current_admin = _extract_admin_context(token)
        target_admin = self.admin_repository.get_admin_by_id(db, data.admin_id)
        if not target_admin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found admin")

        if has_management_permission(target_admin) and current_admin["admin_id"] != data.admin_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không thể đổi mật khẩu admin khác có quyền management")

        password = hash_password(data.password)
        admin = self.admin_repository.change_password(db=db, admin_id=data.admin_id, password_hash=password)
        return {"message": "Password changed successfully", "admin": _admin_to_dict(admin)}

    def delete_account_admin(self, db: Session, admin_id: int, token: str):
        current_admin = _extract_admin_context(token)
        if current_admin["admin_id"] == admin_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Không thể xóa tài khoản của chính mình")

        target_admin = self.admin_repository.get_admin_by_id(db, admin_id)
        if not target_admin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found admin")

        if has_management_permission(target_admin):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không thể xóa admin khác có quyền management")

        self.admin_repository.delete_admin(db=db, admin_id=admin_id)
        return {"message": "Delete successfully"}
