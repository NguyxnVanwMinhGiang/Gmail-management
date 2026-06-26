import datetime

from sqlalchemy.orm import Session
from app.models.email import Email

def check_google_message_id(db: Session, user_id: int, gmail_message_id: str) -> bool:
    existing_email = db.query(Email).filter_by(user_id=user_id, gmail_message_id=gmail_message_id).first()
    return existing_email is not None

def add_email_to_database(
    db: Session,
    user_id: int,
    provider: str,
    gmail_message_id: str,
    gmail_thread_id: str | None = None,
    email_from: str | None = None,
    email_to: str | None = None,
    subject: str | None = None,
    body_text: str | None = None,
    body_html: str | None = None,
    snippet: str | None = None,
    label_ids: list[str] | None = None,
    is_read: bool = False,
    is_starred: bool = False,
    is_deleted: bool = False,
    sent_at: datetime.datetime | None = None,
    received_at: datetime.datetime | None = None
):
    email_entry = Email(
        user_id=user_id,
        provider=provider,
        gmail_message_id=gmail_message_id,
        gmail_thread_id=gmail_thread_id,
        email_from=email_from,
        email_to=email_to,
        subject=subject,
        body_text=body_text,
        body_html=body_html,
        snippet=snippet,
        label_ids=label_ids,
        is_read=is_read,
        is_starred=is_starred,
        is_deleted=is_deleted,
        sent_at=sent_at,
        received_at=received_at
    )
    
    db.add(email_entry)
    db.commit()
    db.refresh(email_entry)
    
    return email_entry


def get_email_data_by_user_id(db: Session, user_id: int, skip: int, limit: int):
    return db.query(
        Email.id,
        Email.subject, 
        Email.email_from, 
        Email.email_to, 
        Email.snippet, 
        Email.received_at, 
        Email.is_read, 
        Email.is_starred
    ).filter(
        Email.user_id == user_id
    ).order_by(
        Email.received_at.desc()
    ).offset(
        skip
    ).limit(
        limit
    ).all()

def get_body_email(db: Session, user_id: int, email_id: int):
    # 1. Query toàn bộ đối tượng Email thay vì chỉ lấy 2 cột
    email = db.query(Email).filter(Email.user_id == user_id, Email.id == email_id).first()
    
    if not email:
        return None
    
    # 2. Kiểm tra và cập nhật trên biến 'email' (instance), KHÔNG phải class 'Email'
    if not email.is_read:
        email.is_read = True 
        db.commit()
        db.refresh(email)  

    return email.body_text, email.body_html

def count_email_by_user(db: Session, user_id: int) -> int:
    return db.query(Email).filter(
        Email.user_id == user_id
    ).count()