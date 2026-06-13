from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import HTTPException, status

from app.core.config import config

def verify_google_token(google_id_token: str):
    try:
        id_info = id_token.verify_oauth2_token(google_id_token, requests.Request(), config.GOOGLE_CLIENT_ID)

        google_user_id = id_info.get("sub")
        email = id_info.get("email")
        full_name = id_info.get("name")
        email_verified = id_info.get("email_verified")

        return {
            "google_user_id": google_user_id,
            "email": email,
            "full_name": full_name,
            "email_verified": email_verified
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token không hợp lệ"
        )
    
    