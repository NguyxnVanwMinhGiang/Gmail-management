# app/models/email.py

from sqlalchemy import Column, BigInteger, String, Text, Boolean, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from app.core.database import Base


class FriendMails(Base):
    __tablename__ = "friend_mails"

    id = Column(BigInteger, primary_key=True, index=True)

    user_id_to = Column(BigInteger, nullable=False)
    user_id_sent = Column(BigInteger, nullable=False)

    message_id = Column(String(255), nullable=False)

    email_from = Column(Text, nullable=True)
    email_to = Column(Text, nullable=True)
    subject = Column(Text, nullable=True)

    body_text = Column(Text, nullable=True)
    body_html = Column(Text, nullable=True)
    snippet = Column(Text, nullable=True)

    file_ = Column(Text, nullable=True)

    is_read = Column(Boolean, default=False)
    is_starred = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)

    sent_at = Column(DateTime, nullable=True)
    received_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(
        DateTime,
        default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )
    __table_args__ = (
        UniqueConstraint(
            "user_id_sent",
            "user_id_to",
            "message_id",
            name="uq_friend_mail"
        ),
    )