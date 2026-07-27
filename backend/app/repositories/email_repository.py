import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.email import Email
from app.models.friend_mail import FriendMails

def check_google_message_id(db: Session, user_id: int, message_id: str) -> bool:
    existing_email = db.query(Email).filter_by(user_id=user_id, message_id=message_id).first()
    return existing_email is not None

def add_email_to_database(
    db: Session,
    user_id: int,
    provider: str,
    message_id: str,
    email_from: str | None = None,
    email_to: str | None = None,
    subject: str | None = None,
    body_text: str | None = None,
    body_html: str | None = None,
    snippet: str | None = None,
    file_: str | None = None,
    is_read: bool = False,
    is_starred: bool = False,
    is_deleted: bool = False,
    is_spam: bool = False,
    sent_at: datetime.datetime | None = None,
    received_at: datetime.datetime | None = None,
    commit: bool = True,
):
    email_entry = Email(
        user_id=user_id,
        provider=provider,
        message_id=message_id,
        email_from=email_from,
        email_to=email_to,
        subject=subject,
        body_text=body_text,
        body_html=body_html,
        snippet=snippet,
        file_=file_,
        is_read=is_read,
        is_starred=is_starred,
        is_deleted=is_deleted,
        is_spam=is_spam,
        sent_at=sent_at,
        received_at=received_at,
    )
    
    db.add(email_entry)
    db.flush()

    if commit:
        db.commit()

    db.refresh(email_entry)
    
    return email_entry


def get_email_data_by_user_id(db: Session, user_id: int, provider: str, my_email: str, skip: int, limit: int, is_deleted: bool, is_starred: bool, is_spam: bool):
    return db.query(
        Email.id,
        Email.message_id,
        Email.subject, 
        Email.email_from, 
        Email.email_to, 
        Email.snippet, 
        Email.received_at, 
        Email.is_read, 
        Email.is_starred,
        Email.is_deleted,
        Email.is_spam
    ).filter(
        Email.provider == provider,
        Email.user_id == user_id,
        Email.email_to == my_email,
        Email.is_deleted == is_deleted,
        Email.is_starred == is_starred,
        Email.is_spam == is_spam
    ).order_by(
        Email.received_at.desc()
    ).offset(
        skip
    ).limit(
        limit
    ).all()

def get_body_email(db: Session, user_id: int, message_id: str, provider: str | None = None):
    query = db.query(Email).filter(Email.user_id == user_id, Email.message_id == message_id)

    if provider is not None:
        email = query.filter(Email.provider == provider).first()
        if not email:
            email = query.first()
    else:
        email = query.first()

    if not email:
        return None

    if not email.is_read:
        email.is_read = True 
        db.commit()
        db.refresh(email)  

    return email.body_text, email.body_html

def get_sent_email(db: Session, user_id: int, skip: int, limit: int, my_email: str):
    return db.query(
        Email.id,
        Email.message_id,
        Email.subject, 
        Email.email_from, 
        Email.email_to, 
        Email.snippet, 
        Email.sent_at, 
        Email.is_read, 
        Email.is_starred,
        Email.is_deleted,
        Email.is_spam,
        Email.received_at
    ).filter(
        Email.user_id == user_id,
        Email.email_from == my_email
    ).order_by(
        Email.sent_at.desc()
    ).offset(
        skip
    ).limit(
        limit
    ).all()

def count_email_by_userID(db: Session, user_id: int, provider: str) -> int:
    stmt = (
        select(func.count())
        .select_from(Email)
        .where(
            Email.user_id == user_id, 
            Email.provider == provider,
            Email.is_deleted == False,
            Email.is_starred == False
        )
    )
    return db.scalar(stmt) or 0

def count_starred_email_by_userID(db: Session, user_id: int, provider: str) -> int:
    stmt = (
        select(func.count())
        .select_from(Email)
        .where(
            Email.user_id == user_id,
            Email.provider == provider,
            Email.is_deleted == False,
            Email.is_starred == True
        )
    )
    return db.scalar(stmt) or 0

def count_deleted_email_by_userID(db: Session, user_id: int, provider: str) -> int:
    stmt = (
        select(func.count())
        .select_from(Email)
        .where(
            Email.user_id == user_id,  
            Email.provider == provider,
            Email.is_deleted == True,
            Email.is_starred == False
        )
    )
    return db.scalar(stmt) or 0


def set_starred_email(db: Session, user_id: int, message_id: str, is_starred: bool):
    email = db.query(Email).filter(Email.user_id == user_id, Email.message_id == message_id).first()
    if email and not email.is_starred:
        if is_starred:
            email.is_starred = True
        else:
            email.is_starred = False

        email.is_deleted = False  # Khi đánh dấu là starred, email sẽ không còn bị xóa
        email.is_spam = False  # Khi đánh dấu là starred, email sẽ không còn bị spam
        db.commit()
        db.refresh(email)

def set_deleted_email(db: Session, user_id: int, message_id: str, is_deleted: bool):
    email = db.query(Email).filter(Email.user_id == user_id, Email.message_id == message_id).first()
    if email and not email.is_deleted:
        if is_deleted:
            email.is_deleted = True
        else:
            email.is_deleted = False
            
        email.is_starred = False  # Khi đánh dấu là deleted, email sẽ không còn bị starred
        email.is_spam = False  # Khi đánh dấu là deleted, email sẽ không còn bị spam
        db.commit()
        db.refresh(email)

def set_spam_email(db: Session, user_id: int, message_id: str, is_spam: bool):
    email = db.query(Email).filter(Email.user_id == user_id, Email.message_id == message_id).first()
    if email and not email.is_spam:
        if is_spam:
            email.is_spam = True
        else:
            email.is_spam = False

        email.is_starred = False
        email.is_deleted = False
        db.commit()
        db.refresh(email)

def delete_email(db: Session, user_id: int, message_id: str):
    email = db.query(Email).filter(Email.user_id == user_id, Email.message_id == message_id).first()
    if email:
        db.delete(email)
        db.commit()

def set_email_sent(db: Session, email_from: str):
    email_entry = db.query(Email).filter(Email.email_from == email_from).first()
    if email_entry:
        db.commit()
        db.refresh(email_entry) 