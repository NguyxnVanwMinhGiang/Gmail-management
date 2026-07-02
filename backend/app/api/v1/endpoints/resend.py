import resend
import time
import random
import string
from datetime import datetime
from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.config import config
from app.core.database import get_db
from app.utils.jwt_util import get_current_user
from app.repositories.email_repository import add_email_to_database

router = APIRouter()

# Điền API Key bạn lấy từ trang chủ resend.com
resend.api_key = config.RESEND_KEY

# Khai báo model nhận dữ liệu từ App của bạn
class EmailRequest(BaseModel):
    from_email: str
    to_email: str
    subject: str
    content: str

# local -> @gmail.com
@router.post("/api/send-email") 
def send_email_outbound(req: EmailRequest, token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db)):
    try:
        token_payload = get_current_user(token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ"
        )
    
    timestamp_hex = hex(int(time.time()))[2:]
    
    # 2. Bù thêm 8 ký tự ngẫu nhiên
    length_needed = 16 - len(timestamp_hex)
    allowed_chars = string.ascii_letters + string.digits
    random_str = ''.join(random.choices(allowed_chars, k=length_needed))

    gmail_message_id = timestamp_hex + random_str
    sent_at = datetime.now()

    # 3. Gửi email thông qua Resend
    params = {
        "from": f"{req.from_email} <onboarding@resend.dev>", 
        "to": [req.to_email],
        "subject": req.subject,
        "html": f"<p>{req.content}</p>",
    }
    try:
        email_response = resend.Emails.send(params)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Không thể gửi email: {str(e)}"
        )
    
    # 4. Lưu thông tin email vào cơ sở dữ liệu
    messsge = add_email_to_database(
        user_id=token_payload,
        provider="local",
        gmail_message_id=gmail_message_id,
        email_from=req.from_email,
        email_to=req.to_email,
        subject=req.subject,
        body_text=req.content,
        body_html=f"<p>{req.content}</p>",
        snippet=req.content[:100],
        sent_at=sent_at
        )

    return {"status": "success", "message": "Thư đã được bàn giao cho Resend đẩy đi!"}