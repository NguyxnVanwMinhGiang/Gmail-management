from ast import Continue
import token

from pydantic import EmailStr
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories import friend_repository, user_repository, google_repository, email_repository
from app.utils.jwt_util import get_current_user


class FriendService:
    email: EmailStr

    def __init__(self):
        self.friend_repository = friend_repository
        self.user_repository = user_repository
        self.google_repository = google_repository
        self.email_repository = email_repository

        
    def check_email_domain(self, v: str) -> str:     
        if v.endswith("@gmail.com"):
            return "user"
        elif v.endswith("@mail.foryou"):
            return "user4u"
        else:
            raise HTTPException(status_code=400, detail="Địa chỉ email không hợp lệ. Vui lòng sử dụng email @gmail.com hoặc @4u.com.")
        
    def checkEmailRq(self, email_from: str, friend_domain: str):
        if email_from == friend_domain:
            raise HTTPException(status_code=400, detail="Bạn không thể gửi lời mời kết bạn cho chính mình.")

    def get_public_key_by_email(self, db: Session, email: str) -> str:
        if self.check_email_domain(email) == "user":
            user = self.google_repository.find_by_google_account(db, email)
            if not user:
                raise HTTPException(status_code=404, detail="Người dùng không tồn tại.")
            return user.public_key
        else:
            user = self.user_repository.find_email_4u(db, email)
            if not user:
                raise HTTPException(status_code=404, detail="Người dùng không tồn tại.")
            return user.public_key
        
    def get_friend_id_by_email(self, db: Session, email: str) -> int:
        if self.check_email_domain(email) == "user":
            user = self.google_repository.find_by_google_account(db, email)
            if not user:
                raise HTTPException(status_code=404, detail="Người dùng không tồn tại.")
            return user.id
        else:
            user = self.user_repository.find_email_4u(db, email)
            if not user:
                raise HTTPException(status_code=404, detail="Người dùng không tồn tại.")
            return user.id
    
    def get_user_id_from_token(self,db: Session, user_id: str, role: str) -> int:
        if role == "user":
            user = self.google_repository.find_by_google_id(db, user_id)
            if not user:
                raise HTTPException(status_code=404, detail="Người dùng không tồn tại.")
            return user.id
        elif role == "user4u":
            user = self.user_repository.find_id_4u(db, user_id)
            if not user:
                raise HTTPException(status_code=404, detail="Người dùng không tồn tại.")
            return user.id
        
    
        

    # ===============================================Main Methods===============================================
    def send_friend_request(self, db: Session, token: str, friend_domain: EmailStr):
        try:
            token_payload = get_current_user(token)
            user_id: str = token_payload["user_id"]
            role = token_payload["role"]
            email_from = token_payload["email"]

            # Kiểm tra xem người dùng có đang cố gắng gửi lời mời kết bạn cho chính mình không
            self.checkEmailRq(email_from, friend_domain)

            my_user_id = self.get_user_id_from_token(db, user_id, role)
            # print("check")
            
            if not token_payload:
                raise HTTPException(status_code=401, detail="Token không hợp lệ")
            
            user_id_friend = self.get_friend_id_by_email(db, friend_domain)
        
            public_key = self.get_public_key_by_email(db, email_from)

            self.friend_repository.send_friend_request(
                db=db,
                sender_id=my_user_id,
                sender_domain=email_from,
                sender_key=public_key,
                receiver_id=user_id_friend,  # Sử dụng ID của người nhận đã tìm được
                receiver_domain=str(friend_domain)
            )
            
            return {
                "success": True,
                "message": "Lời mời kết bạn đã được gửi thành công.",
            }
        except HTTPException as http_exc:
            raise http_exc
        
        
    def accept_friend_request(self, db: Session, token: str, friendship_id: int):
        try:
            token_payload = get_current_user(token)
            user_id = token_payload["user_id"]
            role = token_payload["role"]
            email_from = token_payload["email"]
            
            if not token_payload:
                raise HTTPException(status_code=401, detail="Token không hợp lệ")

            my_user_id = self.get_user_id_from_token(db, user_id, role)

            puplic_key = self.get_public_key_by_email(db, email_from)

            acton = self.friend_repository.accept_friend_request(
                db=db,
                receiver_id=my_user_id,
                receiver_key=puplic_key,
                friendship_id=friendship_id
            )
            return {
                "success": True,
                "message": "Đồng ý lời mời kết bạn thành công.",
            }

        except HTTPException as http_exc:
            raise http_exc
        
    def reject_friend_request(self, db: Session, token: str, friendship_id: int):
        try:
            token_payload = get_current_user(token)
            user_id = token_payload["user_id"]
            role = token_payload["role"]
            email_from = token_payload["email"]

            if not token_payload:
                raise HTTPException(status_code=401, detail="Token không hợp lệ")

            my_user_id = self.get_user_id_from_token(db, user_id, role)

            self.friend_repository.reject_friend_request(
                db=db,
                receiver_id=my_user_id,
                friendship_id=friendship_id
            )

            return {
                "success": True,
                "message": "Từ chối lời mời kết bạn thành công.",
            }

        except HTTPException as http_exc:
            raise http_exc
    
    def cancel_friend_request(self, db: Session, token: str, friendship_id: int):
        try:
            token_payload = get_current_user(token)
            user_id = token_payload["user_id"]
            role = token_payload["role"]

            if not token_payload:
                raise HTTPException(status_code=401, detail="Token không hợp lệ")

            my_user_id = self.get_user_id_from_token(db, user_id, role)

            self.friend_repository.cancel_friend_request(
                db=db,
                sender_id=my_user_id,
                friendship_id=friendship_id
            )

            return {
                "success": True,
                "message": "Đã hủy lời mời kết bạn thành công.",
            }

        except HTTPException as http_exc:
            raise http_exc

    def block_user(self, db: Session, token: str, target_mail: str):
        try:
            token_payload = get_current_user(token)
            user_id = token_payload["user_id"]
            role = token_payload["role"]

            if not token_payload:
                raise HTTPException(status_code=401, detail="Token không hợp lệ")

            my_user_id = self.get_user_id_from_token(db, user_id, role)

            target_user_id = self.get_friend_id_by_email(db, target_mail)

            self.friend_repository.block_user(
                db=db,
                current_user_id=my_user_id,
                target_user_id=target_user_id
            )

            return {
                "success": True,
                "message": "Người dùng đã bị chặn thành công.",
            }

        except HTTPException as http_exc:
            raise http_exc
        
    def get_friend_requests(self, db: Session, token: str):
        try:
            token_payload = get_current_user(token)
            user_id = token_payload["user_id"]
            role = token_payload["role"]

            if not token_payload:
                raise HTTPException(status_code=401, detail="Token không hợp lệ")

            my_user_id = self.get_user_id_from_token(db, user_id, role)

            friend_requests = self.friend_repository.get_received_requests(
                db=db,
                user_id=my_user_id
            )

            return friend_requests

        except HTTPException as http_exc:
            raise http_exc
        
    def get_list_friends(self, db: Session, token: str):
        try:
            token_payload = get_current_user(token)
            user_id = token_payload["user_id"]
            role = token_payload["role"]

            if not token_payload:
                raise HTTPException(status_code=401, detail="Token không hợp lệ")

            my_user_id = self.get_user_id_from_token(db, user_id, role)

            friends_list = self.friend_repository.get_accepted_friends(
                db=db,
                user_id=my_user_id
            )
            friend_ids = []
            for friend in friends_list:
                if friend.user_id_1 == my_user_id:
                    friend_ids.append(friend.user_id_2)
                else:
                    friend_ids.append(friend.user_id_1)
                    
            return friends_list

        except HTTPException as http_exc:
            raise http_exc