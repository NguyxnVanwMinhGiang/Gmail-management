import json
import base64
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.security import encrypt_with_pgp_public_key
from app.repositories.email_repository import add_email_to_database
from app.repositories.google_repository import find_by_google_id, find_by_google_account
from app.repositories.user_repository import find_email_4u, find_id_4u
from app.utils.jwt_util import get_current_user
from datetime import datetime

class SendMailService:
    def send_email(self, db: Session, token: str,
        to: str ,
        subject: str,
        content:str ,
        file_: list,
        message_id: str,
    ):
        try:
            now = datetime.now()
            current_time = now.strftime("%Y-%m-%d %H:%M:%S")
            token_payload = get_current_user(token)
            user_id = token_payload["user_id"]
            role_user = token_payload["role"]
            email_from = token_payload["email"]

            if email_from == to:
                raise HTTPException(status_code=400, detail="Bạn không thể gửi email cho chính mình.")

            if role_user == "user":
                user = find_by_google_id(db, user_id)
                if not user:
                    raise HTTPException(status_code=401, detail="Token không hợp lệ")
                
                user_public_key = user.public_key
                if not user_public_key:
                    raise HTTPException(
                        status_code=400,
                        detail="Bạn chưa cấu hình cặp khóa bảo mật mã hóa (E2EE). Vui lòng thiết lập khóa trước khi đồng bộ email."
                    )
                
                recipient_user = find_email_4u(db, to)
                if not recipient_user:
                    raise HTTPException(status_code=404, detail="Người nhận không tồn tại trong hệ thống.")
                user_id = recipient_user.id

            else:
                user = find_id_4u(db, user_id)
                if not user:
                    raise HTTPException(status_code=401, detail="Token không hợp lệ")
                
                user_public_key = user.public_key
                if not user_public_key:
                    raise HTTPException(
                        status_code=400,
                        detail="Bạn chưa cấu hình cặp khóa bảo mật mã hóa (E2EE). Vui lòng thiết lập khóa trước khi đồng bộ email."
                    )
                
                recipient_user = find_by_google_account(db, to)
                if not recipient_user:
                    raise HTTPException(status_code=404, detail="Người nhận không tồn tại trong hệ thống.")
                user_id = recipient_user.id

            if role_user == "user":
                provider = "user4u"
            else:
                provider = "google"


            
            snippet = " ".join(content.split())[:50]
            
            # --- TIẾN HÀNH MÃ HÓA NỘI DUNG VỚI PUBLIC KEY CỦA USER ---
            encrypted_subject = encrypt_with_pgp_public_key(subject, user_public_key)
            encrypted_snippet = encrypt_with_pgp_public_key(snippet, user_public_key)
            encrypted_body_text = encrypt_with_pgp_public_key(content, user_public_key)
            encrypted_body_html = encrypt_with_pgp_public_key(content, user_public_key)

            file_data_list = []

            # Duyệt qua danh sách file được gửi lên cùng lúc
            for upload_file in file_:
                if upload_file.filename:
                    # 1. BẮT BUỘC dùng await để đọc file bất đồng bộ trong FastAPI
                    file_content = upload_file.file.read()
                    
                    # 2. Chuyển nội dung file từ bytes sang chuỗi mã hóa Base64
                    base64_content = base64.b64encode(file_content).decode('utf-8')
                    
                    # 3. Gom tên file và nội dung đã mã hóa base64 lại
                    file_data_list.append({
                        "filename": upload_file.filename,
                        "content": base64_content
                    })

            encrypted_file = None

            # 4. Gom tất cả danh sách file thành 1 chuỗi JSON và mã hóa PGP
            if file_data_list:
                encrypted_file = encrypt_with_pgp_public_key(
                    json.dumps(file_data_list, ensure_ascii=False),
                    user_public_key
                )
            add_email_to_database(
                db=db,
                user_id=user_id,
                provider=provider,
                message_id=message_id,
                email_from=email_from,
                email_to=to,
                subject=encrypted_subject,
                body_text=encrypted_body_text,
                body_html=encrypted_body_html,
                snippet=encrypted_snippet,
                file_=encrypted_file,
                is_read=False,
                is_starred=False,
                is_deleted=False,
                sent_at=current_time,
                received_at=current_time
            )
            
            return {"message": "Email đã được gửi thành công và lưu vào cơ sở dữ liệu."}

        except HTTPException as http_exc:
            # 2. GIỮ NGUYÊN CÁC LỖI NGHIỆP VỤ (400, 401, 404)
            raise http_exc
        except Exception as e:
            # 3. CHỈ TRẢ VỀ 500 KHI CÓ LỖI HỆ THỐNG THỰC SỰ
            raise HTTPException(status_code=500, detail=f"Đã xảy ra lỗi khi gửi email: {str(e)}")