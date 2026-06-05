from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
import datetime
from app.core.config import config


def generate_jwt_user(user_id, email, algorithm="HS256", expiry_minutes=120):
    """
    Tạo một JWT token.
    
    :param user_id: ID của người dùng hoặc thông tin định danh
    :param secret_key: Khóa bí mật để ký token (giữ bí mật tuyệt đối)
    :param algorithm: Thuật toán mã hóa (mặc định là HS256)
    :param expiry_minutes: Thời gian hết hạn tính bằng phút
    :return: Token dạng string
    """
    payload = {
        "user_id": user_id,
        "email": email,
        "role": "user",
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=expiry_minutes),
        "iat": datetime.datetime.now(datetime.timezone.utc)  # Thời điểm tạo token
    }
    
    token = jwt.encode(payload, config.SECRET_KEY_USER, algorithm=algorithm)
    return token

def generate_jwt_admin(user_id, email, permissions, algorithm="HS256", expiry_minutes=120):
    """
    Tạo một JWT token.
    
    :param user_id: ID của người dùng hoặc thông tin định danh
    :param secret_key: Khóa bí mật để ký token (giữ bí mật tuyệt đối)
    :param algorithm: Thuật toán mã hóa (mặc định là HS256)
    :param expiry_minutes: Thời gian hết hạn tính bằng phút
    :return: Token dạng string
    """
    payload = {
        "user_id": user_id,
        "email": email,
        "role": "admin",
        "permissions": permissions,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=expiry_minutes),
        "iat": datetime.datetime.now(datetime.timezone.utc)  # Thời điểm tạo token
    }
    
    token = jwt.encode(payload, config.SECRET_KEY_ADMIN, algorithm=algorithm)
    # decode = jwt.decode(token, config.SECRET_KEY_ADMIN, algorithms=["HS256"])
    return {
        "token": token,
        # "token_sub": decode.get("user_id"),  # Thời gian hết hạn tính bằng giây
        # "management" : decode.get("permissions").get("management")
    }

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/auth/login")
# def get_current_admin(token: str = Depends(oauth2_scheme)):
#     payload = jwt.decode(token, config.SECRET_KEY_ADMIN, algorithms=["HS256"])

#     admin_id = payload.get("id")
#     admin_role = payload.get("role")
#     admin_permissions = payload.get("permissions").get("management")

#     if admin_role != "admin":
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    
#     if admin_permissions != True:
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    
#     return {
#         "admin_id": admin_id,
#     }

def _normalize_bearer_token(token: str) -> str:
    if token.startswith("Bearer "):
        return token.removeprefix("Bearer ").strip()
    return token.strip()


def get_current_admin(token: str) -> int:
    payload = jwt.decode(_normalize_bearer_token(token), config.SECRET_KEY_ADMIN, algorithms=["HS256"])

    admin_id_raw = payload.get("id") or payload.get("user_id")

    if admin_id_raw is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không có admin id"
        )

    admin_id = int(admin_id_raw)

    admin_role = payload.get("role")
    permissions = payload.get("permissions", {})
    admin_permissions = permissions.get("management")

    if admin_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )
    
    if admin_permissions is not True:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )
    
    return admin_id
