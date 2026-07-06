from pydantic import EmailStr
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories import friendMail_repository
from app.models.friend_mail import FriendMails
from app.repositories import google_repository, user_repository


from app.utils.jwt_util import get_current_user


class friendMailService:
    def __init__(self):
        self.friendMail_repository = friendMail_repository
        self.google_repository = google_repository
        self.user_repository = user_repository

    def get_id_user(self, db: Session, role: str, id_user: int):
        if role == "user":
            user = self.google_repository.find_by_google_id(db, id_user)
        else:
            user = self.user_repository.find_id_4u(db, id_user)

        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng trong hệ thống.")
        return user.id

# ============================================ Main Function ===========================================
    def get_friendemail_header(self, db: Session, token: str, skip: int, limit: int, is_deleted: bool, friend_id: int):
        token_payload = get_current_user(token)

        if not token_payload:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")
            
        id_user = token_payload["user_id"]
        role_user = token_payload["role"]
        my_email = token_payload["email"] # Lấy email từ token để định danh kép (chống trùng ID)
        
        # 1. Xác định user trong DB cục bộ để lấy ra internal ID (user.id)
        user = self.get_id_user(db, role_user, id_user)  # Kiểm tra sự tồn tại của user trong DB cục bộ
            
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng trong hệ thống.")
        
        # 2. Query danh sách thư trao đổi với một người bạn cụ thể từ bảng FriendMails
        data_response = self.friendMail_repository.get_emails_header_by_friend(
            db=db,
            user_id=user,
            friend_id=friend_id,
            is_deleted=is_deleted,
            skip=skip,
            limit=limit,
        )

        if not data_response:
            return {"message": "Không có email nào trong hòm thư.", "data": []}
        
        # 3. Trả về cấu trúc Header tinh gọn (Bỏ qua body_text, body_html để tối ưu dung lượng mạng)
        emails = []
        for email_data in data_response:
            emails.append({
                "friendship_id": email_data.id,
                "message_id": email_data.message_id,
                "subject": email_data.subject,
                "email_from": email_data.email_from,
                "email_to": email_data.email_to,
                "snippet": email_data.snippet,
                "received_at": email_data.received_at,
                "is_read": email_data.is_read,
                "is_deleted": email_data.is_deleted
            })
            
        return {
            "data": emails
        }

    def get_friendemail_sent_header(self, db: Session, token: str, skip: int, limit: int, is_deleted: bool, friend_id: int):
        token_payload = get_current_user(token)

        if not token_payload:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")

        id_user = token_payload["user_id"]
        role_user = token_payload["role"]

        user = self.get_id_user(db, role_user, id_user)

        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng trong hệ thống.")

        data_response = self.friendMail_repository.get_emails_sent_by_friend(
            db=db,
            user_id=user,
            friend_id=friend_id,
            is_deleted=is_deleted,
            skip=skip,
            limit=limit,
        )

        if not data_response:
            return {"message": "Không có email nào trong hòm thư.", "data": []}

        emails = []
        for email_data in data_response:
            emails.append({
                "friendship_id": email_data.id,
                "message_id": email_data.message_id,
                "subject": email_data.subject,
                "email_from": email_data.email_from,
                "email_to": email_data.email_to,
                "snippet": email_data.snippet,
                "received_at": email_data.received_at,
                "is_read": email_data.is_read,
                "is_deleted": email_data.is_deleted
            })

        return {"data": emails}

    def get_email_body_by_id(self, db: Session, token: str, message_id: str, friend_id: int | None = None):
        try:
            token_payload = get_current_user(token)
            if not token_payload:
                raise HTTPException(status_code=401, detail="Token không hợp lệ")
                
            id_user = token_payload["user_id"]
            role_user = token_payload["role"]
            my_email = token_payload["email"] # Dùng để đối chiếu quyền sở hữu email

            # 1. Xác định user trong hệ thống dựa trên role
            user = self.get_id_user(db, role_user, id_user) 
                
            if not user:
                raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")

            # 2. Tìm kiếm email kèm theo ràng buộc bảo mật:
            # Mail đó phải có message_id trùng khớp VÀ (mình là người nhận HOẶC mình là người gửi)
            email_data = self.friendMail_repository.get_friend_mail_body(
                db=db,
                message_id=message_id,
                user_id=user,
                my_email=my_email,
                friend_id=friend_id,
            )

            if not email_data:
                raise HTTPException(
                    status_code=404, 
                    detail="Không tìm thấy email hoặc bạn không có quyền xem thư này."
                )

            # 3. Tự động đánh dấu "Đã đọc" (Nếu mình là người nhận và thư đang ở trạng thái chưa đọc)
            if email_data.email_to == my_email and not email_data.is_read:
                email_data.is_read = True
                db.commit()
                db.refresh(email_data)

            # 4. Trả về đầy đủ dữ liệu bao gồm body dạng text và html
            return {
                "success": True,
                "body_text": email_data.body_text,    # Nội dung thuần chữ
                "body_html": email_data.body_html,    # Nội dung có định dạng giao diện chỉn chu
                "file_": email_data.file_,            # File đính kèm (nếu có)
            }

        except HTTPException as http_exc:
            raise http_exc
        
        