from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.auth_schema import LoginRequestAdmin, RegisterRequest, LoginRequest, RegisterRequestAdmin
from app.repositories import user_repository, admin_repository
from app.utils.hash_util import hash_password, verify_password
from app.utils.jwt_util import generate_jwt_user, generate_jwt_admin, get_current_admin


class AuthServiceUser:
    def __init__(self):
        self.user_repository = user_repository
    
    def register(self, data: RegisterRequest, db: Session):
        existing_user = self.user_repository.find_by_email(db, data.email)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )

        hashed_password = hash_password(data.password)

        self.user_repository.create_user(
            db=db,
            email=data.email,
            password_hash=hashed_password,
            full_name=data.full_name
        )
        return {
            "message" : "User registered successfully",
        }

    def login(self, data: LoginRequest, db: Session):
        user = self.user_repository.find_by_email(db, data.email)

        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sai tai khoan hoac mat khau")
        
        if not verify_password(data.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sai tai khoan hoac mat khau")
        
        generate_token = generate_jwt_user(user.id, user.email)
        
        return {
            "message": "Login successfully",
            "accessToken": generate_token["token"],
            "tokenType": "bearer"
        }


class AuthServiceAdmin:
    def __init__(self):
        self.admin_repository = admin_repository

    def login_admin(self, data: LoginRequestAdmin, db: Session):
        admin = self.admin_repository.find_by_email(db, data.email)
        if not admin:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sai tai khoan hoac mat khau")
        
        if not verify_password(data.password, admin.password_hash):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sai tai khoan hoac mat khau")
        
        generate_token = generate_jwt_admin(admin.id, admin.email, admin.permissions)
        
        return {
            "message": "Login successfully",
            "accessToken": generate_token["token"],
            "tokenType": "bearer"
        }

    def register_admin(self, data: RegisterRequestAdmin, db: Session):

        existing_admin = self.admin_repository.find_by_email(db, data.email)

        if existing_admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        
        permissions = data.permissions

        hashed_password = hash_password(data.password)

        self.admin_repository.create_admin(
            db=db,
            email=data.email,
            password_hash=hashed_password,
            full_name=data.full_name,
            permissions=permissions,
            created_by=get_current_admin().get("id"),
        )
        return {
            "message": "Admin registered successfully",
        }
