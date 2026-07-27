import datetime

import jwt
from fastapi import HTTPException, status

from app.core.config import config


def generate_jwt_user(user_id, email, role, algorithm="HS256", expiry_minutes=120):
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=expiry_minutes),
        "iat": datetime.datetime.now(datetime.timezone.utc),
    }

    token = jwt.encode(payload, config.SECRET_KEY_USER, algorithm=algorithm)
    return {"token": token}


def generate_jwt_admin(user_id, email, permissions, algorithm="HS256", expiry_minutes=120):
    payload = {
        "user_id": user_id,
        "email": email,
        "role": "admin",
        "permissions": permissions or {},
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=expiry_minutes),
        "iat": datetime.datetime.now(datetime.timezone.utc),
    }

    token = jwt.encode(payload, config.SECRET_KEY_ADMIN, algorithm=algorithm)
    return {"token": token}


def _normalize_bearer_token(token: str) -> str:
    if token.startswith("Bearer "):
        return token.removeprefix("Bearer ").strip()
    return token.strip()


def get_current_admin(token: str) -> dict:
    try:
        payload = jwt.decode(_normalize_bearer_token(token), config.SECRET_KEY_ADMIN, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token đã hết hạn")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token không hợp lệ")

    admin_id_raw = payload.get("user_id")
    if admin_id_raw is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token không có admin id")

    try:
        admin_id = int(admin_id_raw)
    except (TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token có admin id không hợp lệ")

    admin_role = payload.get("role")
    permissions = payload.get("permissions") or {}

    if admin_role != "admin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorize")

    return {
        "admin_id": admin_id,
        "role": admin_role,
        "email": payload.get("email"),
        "permissions": permissions,
    }


def get_current_user(token: str) -> int:
    try:
        payload = jwt.decode(_normalize_bearer_token(token), config.SECRET_KEY_USER, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token đã hết hạn")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token không hợp lệ")

    user_id_raw = payload.get("user_id")

    if user_id_raw is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token không có user id")

    try:
        user_id = int(user_id_raw)
    except (TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token có user id không hợp lệ")

    email = payload.get("email")
    if email is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token không có email")

    user_role: str = payload.get("role")
    if user_role != "user" and user_role != "user4u":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorize")

    return {
        "user_id": user_id,
        "role": user_role,
        "email": email,
    }
