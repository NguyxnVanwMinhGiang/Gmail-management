import json
import base64
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_ # Import thêm để truy vấn điều kiện phức tạp

from app.core.security import encrypt_with_pgp_public_key
from app.utils.jwt_util import get_current_user
from datetime import datetime
from app.repositories import friend_repository, email_repository, google_repository, user_repository

class SendMailService:
    def __init__(self):
        self.friend_repository = friend_repository
        self.email_repository = email_repository
        self.google_repository = google_repository
        self.user_repository = user_repository

    def send_email(self, db: Session, token: str,
        to: str,
        subject: str,
        content: str,
        file_: list,
        message_id: str,
    ):
        try:
            now = datetime.now()
            current_time = now.strftime("%Y-%m-%d %H:%M:%S")
            token_payload = get_current_user(token)
            sender_id = token_payload["user_id"] # Đặt tên rõ ràng để tránh nhầm lẫn
            role_user = token_payload["role"]
            email_from = token_payload["email"]

            if email_from == to:
                raise HTTPException(status_code=400, detail="Bạn không thể gửi email cho chính mình.")

            # Xác định đối tượng người gửi và người nhận
            if role_user == "user":
                user = self.google_repository.find_by_google_id(db, sender_id)
                if not user:
                    raise HTTPException(status_code=401, detail="Token không hợp lệ")
                
                recipient_user = self.user_repository.find_email_4u(db, to)
                if not recipient_user:
                    raise HTTPException(status_code=404, detail="Người nhận không tồn tại trong hệ thống.")
                receiver_id = recipient_user.id
                provider = "user4u"
            else:
                user = self.user_repository.find_id_4u(db, sender_id)
                if not user:
                    raise HTTPException(status_code=401, detail="Token không hợp lệ")
                
                recipient_user = self.google_repository.find_by_google_account(db, to)
                if not recipient_user:
                    raise HTTPException(status_code=404, detail="Người nhận không tồn tại trong hệ thống.")
                receiver_id = recipient_user.id
                provider = "google"

            # --- LOGIC KIỂM TRA BẠN BÈ & LẤY PUBLIC KEY ---
            # friendship = db.query(Friend).filter(
            #     or_(
            #         and_(Friend.user_id_1 == user.id, Friend.user_id_2 == receiver_id),
            #         and_(Friend.user_id_1 == receiver_id, Friend.user_id_2 == user.id)
            #     )
            # ).first()
            friendship = self.friend_repository.check_friendship(db, user.id, receiver_id)

            is_spam = True
            target_public_key = None

            # Nếu đã là bạn bè, xác định đúng cột chứa Public Key của đối phương
            if friendship and friendship.status == "accepted":
                is_spam = False
                if friendship.user_id_1 == user.id:
                    target_public_key = friendship.public_key_user_2
                else:
                    target_public_key = friendship.public_key_user_1

            # --- TIẾN HÀNH MÃ HÓA NỘI DUNG (NẾU CÓ PUBLIC KEY) ---
            snippet = " ".join(content.split())[:50]

            if target_public_key:
                encrypted_subject = encrypt_with_pgp_public_key(subject, target_public_key)
                encrypted_snippet = encrypt_with_pgp_public_key(snippet, target_public_key)
                encrypted_body_text = encrypt_with_pgp_public_key(content, target_public_key)
                encrypted_body_html = encrypt_with_pgp_public_key(content, target_public_key)
            else:
                # Nếu không phải bạn bè (hoặc không có key), gửi dạng plain text vào mục Spam
                encrypted_subject = subject
                encrypted_snippet = snippet
                encrypted_body_text = content
                encrypted_body_html = content

            # --- XỬ LÝ FILE ĐÍNH KÈM ---
            file_data_list = []
            for upload_file in file_:
                if upload_file.filename:
                    file_content = upload_file.file.read()
                    base64_content = base64.b64encode(file_content).decode('utf-8')
                    file_data_list.append({
                        "filename": upload_file.filename,
                        "content": base64_content
                    })

            encrypted_file = None
            if file_data_list:
                file_json = json.dumps(file_data_list, ensure_ascii=False)
                if target_public_key:
                    encrypted_file = encrypt_with_pgp_public_key(file_json, target_public_key)
                else:
                    encrypted_file = file_json

            # --- LƯU VÀO DATABASE THÔNG QUA REPOSITORY ---
            self.email_repository.add_email_to_database(
                db=db,
                user_id=receiver_id, # ID người nhận (thay cho biến user_id cũ bị ghi đè)
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
                is_spam=is_spam, # Biến is_spam động dựa trên kiểm tra trạng thái ở trên
                sent_at=current_time,
                received_at=current_time
            )
            
            return {"message": "Email đã được gửi thành công và lưu vào cơ sở dữ liệu."}

        except HTTPException as http_exc:
            raise http_exc
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Đã xảy ra lỗi khi gửi email: {str(e)}")