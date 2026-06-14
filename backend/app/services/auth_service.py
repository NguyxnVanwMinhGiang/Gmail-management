from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.auth_schema import LoginRequestAdmin, RegisterRequest, LoginRequest, RegisterRequestAdmin, GoogleLoginRequest
from app.repositories import user_repository, admin_repository, google_repository
from app.utils.hash_util import hash_password, verify_password
from app.utils.jwt_util import generate_jwt_user, generate_jwt_admin, get_current_admin
from app.utils.getTokenGoogle import verify_google_token


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


class AuthServiceGoogle:
    def __init__(self):
        self.google_repository = google_repository

    def login_google(self, data: GoogleLoginRequest, db: Session):
        google_token = data.id_token or data.credential or data.access_token

        if not google_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Thiếu token đăng nhập Google"
            )

        token_type = "access_token" if data.access_token and not (data.id_token or data.credential) else "id_token"

        google_user = verify_google_token(google_token, token_type)

        google_id = google_user.get("google_user_id")
        email = google_user.get("email")
        full_name = google_user.get("full_name")
        email_verified = google_user.get("email_verified")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không lấy được email từ Google"
            )

        if email_verified is not True:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email Google chưa được xác minh"
            )
    
        user = self.google_repository.find_by_google_id(db, google_id)

        if not user:
            user = self.google_repository.create_user_gg(
                db=db,
                google_id=google_id,
                full_name=full_name,
                email=email,           
                is_verified=True,
                is_active=True
            )

        else:
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Tài khoản đã bị khóa"
                )

        access_token_system = generate_jwt_user(user.id, user.email)

        return {
            "message": "Login Google successfully",
            "accessToken": access_token_system["token"],
            "tokenType": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name
            }
        }