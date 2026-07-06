from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.email_group import EmailGroup, EmailGroupItem
from app.models.email import Email
from app.models.friend_mail import FriendMails
from app.repositories import google_repository, user_repository
from app.utils.jwt_util import get_current_user


class EmailGroupService:
    def _get_auth(self, token: str) -> dict:
        auth = get_current_user(token)
        if not isinstance(auth, dict):
            raise HTTPException(status_code=401, detail="Token không hợp lệ")
        return auth

    def _resolve_user(self, db: Session, auth: dict):
        role = auth.get("role")
        user_id = auth.get("user_id")

        if role == "user":
            user = google_repository.find_by_google_id(db, user_id)
        else:
            user = user_repository.find_id_4u(db, user_id)

        if not user:
            raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

        return user

    def _get_group_or_404(self, db: Session, group_id: int, user_id: int) -> EmailGroup:
        group = db.query(EmailGroup).filter(EmailGroup.id == group_id).first()
        if not group:
            raise HTTPException(status_code=404, detail="Nhóm email không tồn tại")
        if group.user_id != user_id:
            raise HTTPException(status_code=403, detail="Chỉ chủ sở hữu mới được thao tác với nhóm")
        return group

    def _get_email_for_user(self, db: Session, user: object, email_id: int):
        email = db.query(Email).filter(Email.id == email_id, Email.user_id == user.id).first()
        if email:
            return email

        friend_email = db.query(FriendMails).filter(
            FriendMails.id == email_id,
            (FriendMails.user_id_to == user.id) | (FriendMails.user_id_sent == user.id),
        ).first()
        if friend_email:
            return friend_email

        return None

    def create_group(self, db: Session, token: str, name: str, color: str, description: str | None = None):
        auth = self._get_auth(token)
        user = self._resolve_user(db, auth)

        duplicate = db.query(EmailGroup).filter(
            EmailGroup.user_id == user.id,
            EmailGroup.name == name,
        ).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="Bạn đã có nhóm với tên này")

        group = EmailGroup(user_id=user.id, name=name, color=color, description=description)
        db.add(group)
        db.commit()
        db.refresh(group)
        return group

    def list_groups(self, db: Session, token: str):
        auth = self._get_auth(token)
        user = self._resolve_user(db, auth)
        return db.query(EmailGroup).filter(EmailGroup.user_id == user.id).order_by(EmailGroup.created_at.asc()).all()

    def update_group(self, db: Session, token: str, group_id: int, name: str, color: str, description: str | None = None):
        auth = self._get_auth(token)
        user = self._resolve_user(db, auth)
        group = self._get_group_or_404(db, group_id, user.id)

        duplicate = db.query(EmailGroup).filter(
            EmailGroup.user_id == user.id,
            EmailGroup.name == name,
            EmailGroup.id != group_id,
        ).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="Bạn đã có nhóm với tên này")

        group.name = name
        group.color = color
        group.description = description
        db.commit()
        db.refresh(group)
        return group

    def delete_group(self, db: Session, token: str, group_id: int):
        auth = self._get_auth(token)
        user = self._resolve_user(db, auth)
        group = self._get_group_or_404(db, group_id, user.id)
        db.delete(group)
        db.commit()
        return {"detail": "Đã xóa nhóm"}

    def toggle_email_in_group(self, db: Session, token: str, group_id: int, email_id: int):
        auth = self._get_auth(token)
        user = self._resolve_user(db, auth)
        group = self._get_group_or_404(db, group_id, user.id)
        email = self._get_email_for_user(db, user, email_id)
        if not email:
            raise HTTPException(status_code=404, detail="Email không tồn tại hoặc không thuộc quyền sở hữu của bạn")

        existing = db.query(EmailGroupItem).filter(
            EmailGroupItem.group_id == group.id,
            EmailGroupItem.email_id == email_id,
        ).first()
        if existing:
            db.delete(existing)
            db.commit()
            return {"detail": "Đã gỡ email khỏi nhóm", "in_group": False}

        item = EmailGroupItem(group_id=group.id, email_id=email_id)
        db.add(item)
        db.commit()
        db.refresh(item)
        return {"detail": "Đã thêm email vào nhóm", "in_group": True}

    def add_email_to_group(self, db: Session, token: str, group_id: int, email_id: int):
        auth = self._get_auth(token)
        user = self._resolve_user(db, auth)
        group = self._get_group_or_404(db, group_id, user.id)
        email = self._get_email_for_user(db, user, email_id)
        if not email:
            raise HTTPException(status_code=404, detail="Email không tồn tại hoặc không thuộc quyền sở hữu của bạn")

        existing = db.query(EmailGroupItem).filter(
            EmailGroupItem.group_id == group.id,
            EmailGroupItem.email_id == email_id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email đã có trong nhóm này")

        item = EmailGroupItem(group_id=group.id, email_id=email_id)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def remove_email_from_group(self, db: Session, token: str, group_id: int, email_id: int):
        auth = self._get_auth(token)
        user = self._resolve_user(db, auth)
        group = self._get_group_or_404(db, group_id, user.id)
        item = db.query(EmailGroupItem).filter(
            EmailGroupItem.group_id == group.id,
            EmailGroupItem.email_id == email_id,
        ).first()
        if not item:
            raise HTTPException(status_code=404, detail="Email không nằm trong nhóm")

        db.delete(item)
        db.commit()
        return {"detail": "Đã gỡ email khỏi nhóm"}

    def get_group_emails(self, db: Session, token: str, group_id: int):
        auth = self._get_auth(token)
        user = self._resolve_user(db, auth)
        group = self._get_group_or_404(db, group_id, user.id)

        items = db.query(EmailGroupItem).filter(EmailGroupItem.group_id == group.id).order_by(EmailGroupItem.created_at.desc()).all()

        result = []
        for item in items:
            email = db.query(Email).filter(Email.id == item.email_id, Email.user_id == user.id).first()
            if not email:
                email = db.query(FriendMails).filter(
                    FriendMails.id == item.email_id,
                    (FriendMails.user_id_to == user.id) | (FriendMails.user_id_sent == user.id),
                ).first()
            if email:
                result.append({
                    "group_item_id": item.id,
                    "email": email,
                })
        return {"group": group, "items": result}
