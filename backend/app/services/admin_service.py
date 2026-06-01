from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories import admin_repository
from app.schemas.admin_schema import AdminCreate, AdminUpdate, AdminChangePassword
from app.utils.hash_util import hash_password
from app.utils.jwt_util import get_current_admin


class AdminService:
    def list_admin(db: Session):
        return admin_repository.get_all_admin(db)
    
    def create_account_admin(db: Session, data: AdminCreate, token: str):
        admin_create = get_current_admin(token)
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
            created_by=admin_create
        )
        
        return {
            "message": "Admin created successfully",
        }
    
    def update_account_admin(db: Session, data: AdminUpdate, token: str):
        checkAdminCurrent  = get_current_admin(token)
        
        admin = admin_repository.update_admin(
            db=db,
            admin_id=data.admin_id,
            full_name=data.full_name,
            email=data.email,
            permissions=data.permissions,
            is_active=data.is_active,
            is_verified=data.is_verified,
            updated_by=checkAdminCurrent
        )

        if not admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not found admin"
            )
        
    def change_password_admin(db: Session, data: AdminChangePassword, token: str):
        get_current_admin(token)
        #OTP update
        password = hash_password(data.password)
        admin = admin_repository.change_password(
            db=db,
            admin_id=data.admin_id,
            password_hash=password
        )
        return admin

    def delete_account_admin(db: Session, admin_id: int):
        admin_repository.delete_admin(db=db, admin_id=admin_id)
        return {
            "message": "delete successfully"
        }