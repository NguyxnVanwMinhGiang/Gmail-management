from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.auth_schema import E2EEKeysUpdate, LoginRequestAdmin, RegisterRequest, LoginRequest, RegisterRequestAdmin, GoogleLoginRequest
from app.repositories import user_repository, admin_repository, google_repository
from app.utils.hash_util import hash_password, verify_password
from app.utils.jwt_util import generate_jwt_user, generate_jwt_admin, get_current_admin, get_current_user

from app.utils.Google import callAPToken
from app.utils.WatchEmailG import watchEmail

class AuthServiceUser:
    def __init__(self):
        self.user_repository = user_repository
        self.EMAIL_DOMAIN = "@mail.foryou"
    
    def register(self, data: RegisterRequest, db: Session):
        email = f"{data.email}{self.EMAIL_DOMAIN}"
        existing_user = self.user_repository.find_by_email(db, email)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )

        hashed_password = hash_password(data.password)

        self.user_repository.create_user(
            db=db,
            email=email,
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
        
        if not verify_password(data.password, str(user.password_hash)):
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

    def register_admin(self, data: RegisterRequestAdmin, db: Session, token: str):
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
            created_by=get_current_admin(token=token)
        )
        return {
            "message": "Admin registered successfully",
        }

class GoogleLoginService:
    def __init__(self):
        self.google_repository = google_repository

    def refresh_access_token(self, code: str, db: Session):
        callApi = callAPToken(code)

        google_id = callApi["google_id"]
        full_name = callApi["full_name"]
        email = callApi["email"]
        google_refresh_token = callApi["google_refresh_token"]
        google_token_expires_at = callApi["google_token_expires_at"]

        user = self.google_repository.find_by_google_account(db, email)

        if user:
            user = self.google_repository.update_user_gg(
                db,
                google_id,
                full_name,
                google_refresh_token,
                google_token_expires_at
            )
        else:
            user = self.google_repository.create_user_gg(
                db=db,
                google_id=google_id,
                full_name=full_name,
                email=email,
                google_refresh_token=google_refresh_token,
                google_token_expires_at=google_token_expires_at
            )
        watchEmail(google_refresh_token)  # Gọi hàm watchEmail với refresh_token của người dùng
        system_jwt_token = generate_jwt_user(user.google_id, email)

        return {
            "message": "Login successfully",
            "accessToken": system_jwt_token["token"],
            "tokenType": "bearer",
            "user": {
                "email": email,
                "full_name": full_name,
                "role": "user"
            }
        }
    
    def save_e2ee_keys(self, keys_data: E2EEKeysUpdate, token, db: Session):
        user_id = get_current_user(token)
        
        user = self.google_repository.find_by_google_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
            
        user.public_key = keys_data.public_key
        user.encrypted_private_key = keys_data.encrypted_private_key
        db.commit()
        
        return {"message": "Đã lưu bộ khóa E2EE an toàn."}

    def get_e2ee_keys(self, token: str, db: Session):
        user_id = get_current_user(token)
    
        user = self.google_repository.find_by_google_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
            
        # Trả về khóa nếu đã thiết lập, hoặc null nếu là tài khoản mới
        return {
            "has_keys": bool(user.encrypted_private_key),
            "public_key": user.public_key,
            "encrypted_private_key": user.encrypted_private_key
        }