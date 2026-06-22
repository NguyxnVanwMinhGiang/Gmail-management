from fastapi import HTTPException, status
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
    return {"token": token}


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
    }

def _normalize_bearer_token(token: str) -> str:
    if token.startswith("Bearer "):
        return token.removeprefix("Bearer ").strip()
    return token.strip()


def get_current_admin(token: str) -> int:
    try:
        payload = jwt.decode(_normalize_bearer_token(token), config.SECRET_KEY_ADMIN, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token đã hết hạn"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ"
        )

    admin_id_raw = payload.get("user_id")

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
            detail="Unauthorize"
        )
    
    if admin_permissions is not True:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )
    
    return admin_id

def get_current_user(token: str) -> int:
    try:
        payload = jwt.decode(_normalize_bearer_token(token), config.SECRET_KEY_USER, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token đã hết hạn"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ"
        )

    user_id_raw = payload.get("user_id")

    if user_id_raw is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không có user id"
        )

    try:
        user_id = int(user_id_raw)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token có user id không hợp lệ"
        )

    user_role = payload.get("role")

    if user_role != "user":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorize"
        )
    
    return user_id # neu la tai khoan google thi user_id la google_id, neu la tai khoan thuong thi user_id la user_id trong db

