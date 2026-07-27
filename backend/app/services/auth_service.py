from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.auth_schema import E2EEKeysUpdate, LoginRequestAdmin, RegisterRequest, LoginRequest, RegisterRequestAdmin, GoogleLoginRequest
from app.repositories import user_repository, admin_repository, google_repository, email_repository
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
        existing_user = self.user_repository.find_email_4u(db, email)

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
        user = self.user_repository.find_email_4u(db, data.email)
        role = "user4u"

        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sai tai khoan hoac mat khau")
        
        if not verify_password(data.password, str(user.password_hash)):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sai tai khoan hoac mat khau")
        
        generate_token = generate_jwt_user(user.id, user.email, role)
        
        return {
            "message": "Login successfully",
            "accessToken": generate_token["token"],
            "tokenType": "bearer",
            "user": {
                "email": user.email,
                "full_name": user.full_name,
            }
        }
    
    
class AuthServiceAdmin:
    def __init__(self):
        self.admin_repository = admin_repository
        
    def login_admin(self, email: str, password: str, db: Session):
        try: 
            # check tai khoan co ton tai khong
            print("1")
            admin = self.admin_repository.find_admin_by_email(db, email)
            if admin is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sai tai khoan hoac mat khau")
            
            # check mat khau co dung khong
            if not verify_password(password, admin.password_hash):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sai tai khoan hoac mat khau")
            
            # check tai khoan co bi khoa khong
            if not admin.is_active:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tài khoản đã bị khóa")
            
            generate_token = generate_jwt_admin(admin.id, admin.email, admin.permissions)

            return {
                "message": "Login successfully",
                "accessToken": generate_token["token"],
                "tokenType": "bearer"
            }
        except HTTPException as http_exc:
            raise http_exc


    def register_admin(self, db: Session, token: str, data: RegisterRequestAdmin):
        token_payload = get_current_admin(token)
        my_id = token_payload["admin_id"]
        my_email = token_payload["email"]
        my_role = token_payload["role"]
        my_permissions = token_payload["permissions"].get("management", False)

        if not token_payload:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
        if my_role != 'admin' or my_permissions != True:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        #  ktra email thien tai co trong danh sach admin khong
        existing_admin = self.admin_repository.find_admin_by_email(db, data.email)

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
            created_by=my_id
        )
        return {
            "message": "Admin registered successfully",
        }

class GoogleLoginService:
    def __init__(self):
        self.google_repository = google_repository

    def refresh_access_token(self, code: str, db: Session):
        callApi = callAPToken(code)
        role = "user"

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
        system_jwt_token = generate_jwt_user(user.google_id, email, role)

        return {
            "message": "Login successfully",
            "accessToken": system_jwt_token["token"],
            "tokenType": "bearer",
            "user": {
                "email": email,
                "full_name": full_name,
            }
        }
    
class E2EEKeyService:
    def __init__(self):
        self.google_repository = google_repository
        self.user_repository = user_repository

    def save_e2ee_keys(self, keys_data: E2EEKeysUpdate, token, db: Session):
        token_payload = get_current_user(token)
        user_id = token_payload["user_id"]
        user_role = token_payload["role"]
        if user_role == "user":
            try:
                user = self.google_repository.find_by_google_id(db, user_id)
                if not user:
                    raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
                    
                user.public_key = keys_data.public_key
                user.encrypted_private_key = keys_data.encrypted_private_key
                db.commit()
            except Exception as e:
                raise HTTPException(status_code=500, detail="Lỗi khi lưu bộ khóa E2EE")
        else:
            try:
                user = self.user_repository.find_id_4u(db, user_id)
                if not user:
                    raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
                    
                user.public_key = keys_data.public_key
                user.encrypted_private_key = keys_data.encrypted_private_key
                db.commit()
            except Exception as e:
                raise HTTPException(status_code=500, detail="Lỗi khi lưu bộ khóa E2EE")
            
        return {"message": "Đã lưu bộ khóa E2EE an toàn."}

    def get_e2ee_keys(self, token: str, db: Session):

        token_payload = get_current_user(token)

        user_id = token_payload["user_id"]
        user_role = token_payload["role"]

        if user_role == "user":
            try:
                user = self.google_repository.find_by_google_id(db, user_id)
                if not user:
                    raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
            except Exception as e:
                raise HTTPException(status_code=500, detail="Lỗi khi lưu bộ khóa E2EE")
        else:
            try:
                user = self.user_repository.find_id_4u(db, user_id)
                if not user:
                    raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
            except Exception as e:
                raise HTTPException(status_code=500, detail="Lỗi khi lưu bộ khóa E2EE")

        # Trả về khóa nếu đã thiết lập, hoặc null nếu là tài khoản mới
        return {
            "has_keys": bool(user.encrypted_private_key),
            "public_key": user.public_key,
            "encrypted_private_key": user.encrypted_private_key
        }
    
class Me:
    def __init__(self):
        self.google_repository = google_repository
        self.user_repository = user_repository
        self.email_repository = email_repository

    def get_info_me(self, token: str, db: Session):
        token_payload = get_current_user(token)
        user_id = token_payload["user_id"]
        user_role = token_payload["role"]

        if user_role == "user":
            user = self.google_repository.find_by_google_id(db, user_id)
            if not user:
                raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
            
            total_emails = self.email_repository.count_email_by_userID(db, user.id, provider="google")
            total_starred = self.email_repository.count_starred_email_by_userID(db, user.id, provider="google")
            total_deleted = self.email_repository.count_deleted_email_by_userID(db, user.id, provider="google")
        else:
            user = self.user_repository.find_id_4u(db, user_id)
            if not user:
                raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
            total_emails = self.email_repository.count_email_by_userID(db, user.id, provider=user_role)
            total_starred = self.email_repository.count_starred_email_by_userID(db, user.id, provider=user_role)
            total_deleted = self.email_repository.count_deleted_email_by_userID(db, user.id, provider=user_role)
        return {
            "email": user.email,
            "role": user_role,
            "total_emails": total_emails,
            "total_starred": total_starred,
            "total_deleted": total_deleted
        }