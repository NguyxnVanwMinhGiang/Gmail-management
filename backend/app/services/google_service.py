import imaplib
import email
import google.auth.transport.requests
from sqlalchemy.orm import Session
from fastapi import HTTPException
import re

from app.core.security import extract_email_metadata, get_email_snippet, get_email_full_bodies, encrypt_with_pgp_public_key, decode_imap_header
from app.utils.Google import refreshGoogleToken
from app.repositories.email_repository import add_email_to_database, check_google_message_id, delete_email, get_body_email, get_email_data_by_user_id, set_deleted_email, set_starred_email
from app.repositories.google_repository import (
    getRefreshTokenByUserId,
    find_by_google_id,
)
from app.utils.jwt_util import get_current_user
from app.repositories.user_repository import find_id_4u


class GmailService:
    def fetch_and_save_emails(self, db: Session, token: str, max_results: int):
        # 1. Lấy và bóc tách thông tin từ Token
        token_payload = get_current_user(token)

        if not token_payload:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")

        # 2. Tìm user trong DB
        user_gg = find_by_google_id(db, token_payload)

        if user_gg is None:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy tài khoản Google liên kết với người dùng hiện tại.",
            )


        # KIỂM TRA KHÓA CÔNG KHAI (E2EE Public Key)
        user_public_key = user_gg.public_key
        if not user_public_key:
            raise HTTPException(
                status_code=400,
                detail="Bạn chưa cấu hình cặp khóa bảo mật mã hóa (E2EE). Vui lòng thiết lập khóa trước khi đồng bộ email."
            )

        # Trích xuất dữ liệu từ Database chuẩn xác (dùng khóa chính tự tăng .id)
        user_gg_id = user_gg.id 
        email_address: str = user_gg.email
        refresh_token = getRefreshTokenByUserId(db, user_gg_id)

        if not refresh_token:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy Google refresh token. Vui lòng đăng nhập bằng Google trước khi đồng bộ email.",
            )

        mail = None
        try:
            # 3. Làm mới Access Token
            creds = refreshGoogleToken(refresh_token)
            request = google.auth.transport.requests.Request()
            creds.refresh(request)
            access_token = creds.token

            # 4. Xác thực IMAP bằng XOAUTH2
            auth_string = f"user={email_address}\x01auth=Bearer {access_token}\x01\x01"

            mail = imaplib.IMAP4_SSL('imap.gmail.com')
            mail.authenticate('XOAUTH2', lambda x: auth_string.encode('utf-8'))
            
            mail.select('INBOX')

            # 5. Tìm kiếm ID của toàn bộ email
            status, data = mail.search(None, 'ALL')
            mail_ids = data[0].split()

            if not mail_ids:
                mail.logout()
                return {"message": "Không có email nào.", "total_fetched": 0, "total_new_saved": 0}
            
            total_emails = len(mail_ids)
            start_idx = max(0, total_emails - max_results)

            target_ids = mail_ids[start_idx:total_emails]
            saved_count = 0
            # 6. Lặp qua và lưu trữ
            for num in reversed(target_ids):
                status, msg_data = mail.fetch(num, '(RFC822)')
                
                for response_part in msg_data:
                    if isinstance(response_part, tuple):
                        raw_email = response_part[1]
                        msg = email.message_from_bytes(raw_email)
                        
                        raw_message_id = msg.get('Message-ID', '')
                        gmail_msg_id = str(raw_message_id.strip('<>') if raw_message_id else num.decode('utf-8'))
                        gmail_normalize = re.sub(r'[^a-zA-Z0-9]', '', gmail_msg_id)
                        message_id: str = gmail_normalize[:16]
                        
                        if check_google_message_id(db, user_gg_id, message_id):
                            continue

                        # --- TRÍCH XUẤT CÁC THÀNH PHẦN (PLAIN TEXT THÔ) ---
                        raw_subject = decode_imap_header(msg.get('Subject', 'No Subject'))
                        sender = decode_imap_header(msg.get('From', 'Unknown'))
                        receiver = decode_imap_header(msg.get('To', email_address))
                        raw_snippet = get_email_snippet(msg)
                        raw_body_text, raw_body_html = get_email_full_bodies(msg)

                        # --- TRÍCH XUẤT THÔNG TIN METADATA ---
                        metadata = extract_email_metadata(mail, msg, num)
                        

                        # --- TIẾN HÀNH MÃ HÓA NỘI DUNG VỚI PUBLIC KEY CỦA USER ---
                        encrypted_subject = encrypt_with_pgp_public_key(raw_subject, user_public_key)
                        encrypted_snippet = encrypt_with_pgp_public_key(raw_snippet, user_public_key)
                        encrypted_body_text = encrypt_with_pgp_public_key(raw_body_text, user_public_key)
                        encrypted_body_html = encrypt_with_pgp_public_key(raw_body_html, user_public_key)

                        # --- LƯU VÀO DATABASE (Nội dung đã mã hóa, Metadata giữ thô) ---
                        add_email_to_database(
                            db=db,
                            user_id=user_gg_id,
                            provider="google",
                            message_id=message_id,
                            email_from=sender,
                            email_to=receiver,         # Truyền thêm thông tin người nhận nếu cần công khai
                            subject=encrypted_subject, # Đã mã hóa
                            body_text=encrypted_body_text, # Đã mã hóa
                            body_html=encrypted_body_html, # Đã mã hóa
                            snippet=encrypted_snippet, # Đã mã hóa
                            sent_at=metadata["sent_at"],
                            received_at=metadata["received_at"],
                            is_read=metadata["is_read"],
                            is_starred=metadata["is_starred"],
                            is_deleted=metadata["is_deleted"],
                        )
                        saved_count += 1

            mail.close()
            mail.logout()


            return {
                "message": "Đồng bộ email qua giao thức IMAP và mã hóa bảo mật thành công",
                "total_fetched": len(target_ids),
                "total_new_saved": saved_count,
            }

        except imaplib.IMAP4.error as e:
            if mail is not None:
                try: mail.logout()
                except: pass
            error_msg = str(e)
            if "AUTHENTICATIONFAILED" in error_msg.upper():
                raise HTTPException(status_code=401, detail="Xác thực IMAP thất bại. Hãy đảm bảo tài khoản đã bật quyền truy cập.")
            raise HTTPException(status_code=500, detail=f"Lỗi IMAP: {error_msg}")

        except Exception as e:
            if mail is not None:
                try: mail.logout()
                except: pass
            raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")
        

    def get_email_body(self, db: Session, token: str, message_id: str):
        token_payload = get_current_user(token)

        if not token_payload:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")
        
        id_user = token_payload["user_id"]
        role_user = token_payload["role"]
        
        if role_user == "user":
            user = find_by_google_id(db, id_user)
            if not user:
                raise HTTPException(status_code=401, detail="Token không hợp lệ")
            
            email_content = get_body_email(db, user.id, message_id, provider="google")
        else:
            user = find_id_4u(db, id_user)
            if not user:
                raise HTTPException(status_code=401, detail="Token không hợp lệ")

            email_content = get_body_email(db, user.id, message_id, provider="user4u")
        
        if email_content is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy email với ID đã cho.")

        return {
            "email_id": message_id,
            "body_text": email_content[0],
            "body_html": email_content[1]
        }
    
    def get_emails_header(self, db: Session, token: str, skip: int, limit: int, is_deleted: bool, is_starred: bool):
        token_payload = get_current_user(token)

        if not token_payload:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")
        
        id_user = token_payload["user_id"]
        role_user = token_payload["role"]
        
        if role_user == "user":
            user = find_by_google_id(db, id_user)
            data_response = get_email_data_by_user_id(db, user.id, provider="google", skip=skip, limit=limit, is_deleted=is_deleted, is_starred=is_starred)
        else:
            user = find_id_4u(db, id_user)
            data_response = get_email_data_by_user_id(db, user.id, provider="user4u", skip=skip, limit=limit, is_deleted=is_deleted, is_starred=is_starred)
        

        if not data_response:
            return {"message": "Không có email nào trong hòm thư.", "data": []}
        
        emails = []
        for email_data in data_response:
            emails.append({
                "message_id": email_data.message_id,
                "subject": email_data.subject,
                "email_from": email_data.email_from,
                "email_to": email_data.email_to,
                "snippet": email_data.snippet,
                "received_at": email_data.received_at,
                "is_read": email_data.is_read,
                "is_starred": email_data.is_starred,
                "is_deleted": email_data.is_deleted
            })
        return {
            "data": emails
        }
    
    def set_starred_email(self, db: Session, token: str, message_id: str, is_starred: bool):
        token_payload = get_current_user(token)

        if not token_payload:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")

        id_user = token_payload["user_id"]
        role_user = token_payload["role"]

        if role_user == "user":
            user = find_by_google_id(db, id_user)
        else:
            user = find_id_4u(db, id_user)

        try:
            if is_starred:
                set_starred_email(db, user.id, message_id, is_starred=True)
            else:
                set_starred_email(db, user.id, message_id, is_starred=False)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi khi đánh dấu email là sao: {str(e)}")

    def set_deleted_email(self, db: Session, token: str, message_id: str, is_deleted: bool):
        token_payload = get_current_user(token)

        if not token_payload:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")

        id_user = token_payload["user_id"]
        role_user = token_payload["role"]

        if role_user == "user":
            user = find_by_google_id(db, id_user)
        else:
            user = find_id_4u(db, id_user)

        try:
            if is_deleted:
                set_deleted_email(db, user.id, message_id, is_deleted=True)
            else:
                set_deleted_email(db, user.id, message_id, is_deleted=False)

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi khi đánh dấu email là đã xóa: {str(e)}")
    
    def delete_email(self, db: Session, token: str, message_id: str):
        token_payload = get_current_user(token)

        if not token_payload:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")

        id_user = token_payload["user_id"]
        role_user = token_payload["role"]

        if role_user == "user":
            user = find_by_google_id(db, id_user)
        else:
            user = find_id_4u(db, id_user)

        try:   
            delete_email(db, user.id, message_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi khi xóa email: {str(e)}")