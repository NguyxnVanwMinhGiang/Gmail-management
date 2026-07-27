
# from fastapi import HTTPException, status

# 
# from app.core.config import config

# from app.repositories.email_repository import add_email_to_database
# from app.core.security import encrypt_with_pgp_public_key

# # Điền API Key bạn lấy từ trang chủ resend.com
# resend.api_key = config.RESEND_KEY

# # local -> @gmail.com
# def send_email_outbound(from_email: str, to_email: str, subject: str, content: str, user_id: int, user_public_key,db: Session):
    
    
#     
    
#     # 2. Bù thêm 8 ký tự ngẫu nhiên
#     

#     # 3. Gửi email thông qua Resend
#     params = {
#         "from": f"{from_email} <onboarding@resend.dev>", 
#         "to": ["nguyengiang21102005@gmail.com"],
#         "subject": encrypted_subject,
#         "html": f"<p>{encrypted_body_html}</p>",
#     }
#     try:
#         resend.Emails.send(params)
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Không thể gửi email: {str(e)}"
#         )
    
#     # 4. Lưu thông tin email vào cơ sở dữ liệu
#     message = add_email_to_database(
#         db=db,
#         user_id=user_id,
#         provider="anonymous",
#         message_id=message_id,
#         email_from=from_email,
#         email_to=to_email,
#         subject=encrypted_subject,
#         body_text=encrypted_body_text,
#         body_html=encrypted_body_html,
#         snippet=encrypted_snippet,
#         file_=None,
#         is_read=False,
#         is_starred=False,
#         is_deleted=False,
#         is_spam=False,
#         sent_at=sent_at,
#         received_at=current_time
#         )
    
#     return {"status": "success", "message": "Thư đã được bàn giao cho Resend đẩy đi!"}

import time
import random
import string
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.config import config
from app.core.security import encrypt_with_pgp_public_key
from app.repositories.email_repository import add_email_to_database


def send_smtp_email(email_from: str, email_to: str, subject:str, body:str, user_public_key, user_id:int, db: Session):
    message = MIMEMultipart()
    message["From"] = config.SENDER_EMAIL
    message["To"] = email_to
    message["Subject"] = subject

    body = body
    message.attach(MIMEText(body, "plain"))

    timestamp_hex = hex(int(time.time()))[2:]
    length_needed = 16 - len(timestamp_hex)
    allowed_chars = string.ascii_letters + string.digits
    random_str = ''.join(random.choices(allowed_chars, k=length_needed))

    message_id = timestamp_hex + random_str
    sent_at = datetime.now()
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    try:
        print("Đang kết nối tới máy chủ Gmail SMTP...")
        # Bước 1 & 2: Kết nối SSL trực tiếp đến server
        with smtplib.SMTP_SSL(config.SMTP_SERVER, config.SMTP_PORT) as server:
            
            # Thiết lập chế độ debug để xem các lệnh raw chạy ngầm (tùy chọn)
            server.set_debuglevel(1) 
            
            print("Đang đăng nhập...")
            # Bước 4: Đăng nhập bằng tài khoản và App Password
            server.login(config.SENDER_EMAIL, config.SMTP_PASSWORD)
            
            print(f"Đang gửi email: {email_to}")
            # Bước 5 & 6: Khai báo người gửi/nhận và truyền DATA (Hàm send_message tự động xử lý)
            server.send_message(message)
        
    except HTTPException as http_exc:
        raise http_exc

    snippet = " ".join(body.split())[:50]
    encrypted_subject = encrypt_with_pgp_public_key(subject, user_public_key)
    encrypted_snippet = encrypt_with_pgp_public_key(snippet, user_public_key)
    encrypted_body_text = encrypt_with_pgp_public_key(body, user_public_key)
    encrypted_body_html = encrypt_with_pgp_public_key(body, user_public_key)
    
    add_email_to_database(
        db=db,
        user_id=user_id,
        provider="anonymous",
        message_id=message_id,
        email_from=email_from,
        email_to=email_to,
        subject=encrypted_subject,
        body_text=encrypted_body_text,
        body_html=encrypted_body_html,
        snippet=encrypted_snippet,
        file_=None,
        is_read=False,
        is_starred=False,
        is_deleted=False,
        is_spam=False,
        sent_at=sent_at,
        received_at=current_time
    )
    return {"status": "success", "message": "Thư đã được gửi thành công!"}