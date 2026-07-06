import datetime

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session
from app.models.friend_mail import FriendMails


def add_friendmail_to_database(
    db: Session,
    user_id_to: int,
    user_id_sent: int,
    message_id: str,
    email_from: str | None = None,
    email_to: str | None = None,
    subject: str | None = None,
    body_text: str | None = None,
    body_html: str | None = None,
    snippet: str | None = None,
    file_: str | None = None,
    is_read: bool = False,
    is_deleted: bool = False,
    sent_at: datetime.datetime | None = None,
    received_at: datetime.datetime | None = None
):
    email_entry = FriendMails(
        user_id_to=user_id_to,
        user_id_sent=user_id_sent,
        message_id=message_id,
        email_from=email_from,
        email_to=email_to,
        subject=subject,
        body_text=body_text,
        body_html=body_html,
        snippet=snippet,
        file_=file_,
        is_read=is_read,
        is_deleted=is_deleted,
        sent_at=sent_at,
        received_at=received_at
    )
    
    db.add(email_entry)
    db.commit()
    db.refresh(email_entry)
    
    return email_entry



def get_emails_header(
    db: Session,
    user_id: int,
    my_email: str,
    is_deleted: bool,
    skip: int = 0,
    limit: int = 20,
):
    return (
        db.query(FriendMails)
        .filter(
            FriendMails.user_id_to == user_id,
            FriendMails.email_to == my_email,
            FriendMails.is_deleted == is_deleted,
        )
        .order_by(FriendMails.received_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_emails_header_by_friend(
    db: Session,
    user_id: int,
    friend_id: int,
    is_deleted: bool,
    skip: int = 0,
    limit: int = 20,
):
    return (
        db.query(FriendMails)
        .filter(
            FriendMails.is_deleted == is_deleted,
            or_(
                and_(FriendMails.user_id_to == user_id, FriendMails.user_id_sent == friend_id),
                and_(FriendMails.user_id_to == friend_id, FriendMails.user_id_sent == user_id),
            ),
        )
        .order_by(FriendMails.received_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_emails_sent_by_friend(
    db: Session,
    user_id: int,
    friend_id: int,
    is_deleted: bool,
    skip: int = 0,
    limit: int = 20,
):
    return (
        db.query(FriendMails)
        .filter(
            FriendMails.is_deleted == is_deleted,
            FriendMails.user_id_sent == user_id,
            FriendMails.user_id_to == friend_id,
        )
        .order_by(FriendMails.received_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_friend_mail_body(
    db: Session,
    message_id: str,
    user_id: int,
    my_email: str,
    friend_id: int | None = None,
):
    filters = [FriendMails.message_id == message_id]

    if friend_id is not None:
        filters.append(
            or_(
                and_(FriendMails.user_id_to == user_id, FriendMails.user_id_sent == friend_id),
                and_(FriendMails.user_id_to == friend_id, FriendMails.user_id_sent == user_id),
            )
        )
    else:
        filters.append(
            or_(
                and_(
                    FriendMails.user_id_to == user_id,
                    FriendMails.email_to == my_email,
                ),
                and_(
                    FriendMails.user_id_sent == user_id,
                    FriendMails.email_from == my_email,
                ),
            )
        )

    return db.query(FriendMails).filter(*filters).first()
