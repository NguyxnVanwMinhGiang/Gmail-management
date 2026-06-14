import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi import HTTPException, status

from app.core.config import config

def verify_google_token(google_token: str, token_type: str = "id_token"):
    try:
        if token_type == "access_token":
            response = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={
                    "Authorization": f"Bearer {google_token}"
                },
                timeout=10,
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Google token không hợp lệ"
                )

            google_user = response.json()

            return {
                "google_user_id": google_user.get("sub"),
                "email": google_user.get("email"),
                "full_name": google_user.get("name"),
                "email_verified": google_user.get("email_verified")
            }

        id_info = id_token.verify_oauth2_token(
            google_token,
            google_requests.Request(),
            config.GOOGLE_CLIENT_ID
        )

        return {
            "google_user_id": id_info.get("sub"),
            "email": id_info.get("email"),
            "full_name": id_info.get("name"),
            "email_verified": id_info.get("email_verified")
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token không hợp lệ"
        )
    
    