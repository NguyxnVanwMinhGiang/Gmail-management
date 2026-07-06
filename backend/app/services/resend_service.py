import resend
import time
import random
import string
from datetime import datetime
from fastapi import HTTPException, status

from sqlalchemy.orm import Session
from app.core.config import config

from app.repositories.email_repository import add_email_to_database

# Điền API Key bạn lấy từ trang chủ resend.com
resend.api_key = config.RESEND_KEY

# local -> @gmail.com
def send_email_outbound(from_email: str, to_email: str, subject: str, content: str, user_id: int, db: Session):
    
    timestamp_hex = hex(int(time.time()))[2:]
    
    # 2. Bù thêm 8 ký tự ngẫu nhiên
    length_needed = 16 - len(timestamp_hex)
    allowed_chars = string.ascii_letters + string.digits
    random_str = ''.join(random.choices(allowed_chars, k=length_needed))

    message_id = timestamp_hex + random_str
    sent_at = datetime.now()
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 3. Gửi email thông qua Resend
    print(f"Email sent successfully1")
    params = {
        "from": f"{from_email} <onboarding@resend.dev>", 
        "to": ["nguyengiang21102005@gmail.com"],
        "subject": subject,
        "html": f"<p>{content}</p>",
    }
    try:
        email_response = resend.Emails.send(params)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Không thể gửi email: {str(e)}"
        )
    
    # 4. Lưu thông tin email vào cơ sở dữ liệu
    print(f"Email sent successfully2")
    message = add_email_to_database(
        db=db,
        user_id=user_id,
        provider="anonymous",
        message_id=message_id,
        email_from=from_email,
        email_to=to_email,
        subject=subject,
        body_text=content,
        body_html=f"<p>{content}</p>",
        snippet=content[:100],
        file_=None,
        is_read=False,
        is_starred=False,
        is_deleted=False,
        is_spam=False,
        sent_at=sent_at,
        received_at=current_time
        )
    
    return {"status": "success", "message": "Thư đã được bàn giao cho Resend đẩy đi!"}