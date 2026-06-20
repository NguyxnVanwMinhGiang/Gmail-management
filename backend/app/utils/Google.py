import requests
from datetime import datetime, timedelta
from fastapi import HTTPException, status

from google.oauth2.credentials import Credentials

from app.core.config import config

def callAPToken(code: str):
    response = requests.post(
        "https://oauth2.googleapis.com/token",        
        data={
            "client_id": config.GOOGLE_CLIENT_ID,
            "client_secret": config.GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": config.GOOGLE_REDIRECT_URI,
        }
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.json()
        )

    token_data = response.json()
    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    expires_in = token_data.get("expires_in", 3600)
    google_token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)

    user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    try:
        # requests.get cũng là hàm đồng bộ
        user_info_response = requests.get(user_info_url, headers=headers)
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi kết nối khi lấy thông tin user: {str(e)}"
        )
    
    user_info = user_info_response.json()
    google_id = user_info.get("id")
    email = user_info.get("email")
    full_name = user_info.get("name")

    if not google_id or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể lấy thông tin người dùng từ Google"
        )
    
    return {
        "google_id": google_id,
        "email": email,
        "full_name": full_name,
        "google_refresh_token": refresh_token,
        "google_token_expires_at": google_token_expires_at
    }


def refreshGoogleToken(refresh_token: str):
    """
    Tạo đối tượng Credentials từ refresh_token. 
    Thư viện sẽ tự động refresh access_token khi cần.
    """
    return Credentials(
            token=None,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=config.GOOGLE_CLIENT_ID,
            client_secret=config.GOOGLE_CLIENT_SECRET
        )