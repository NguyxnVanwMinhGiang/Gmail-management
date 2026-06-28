# app/models/email.py

from sqlalchemy import Column, BigInteger, String, Text, Boolean, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from app.core.database import Base


class Email(Base):
    __tablename__ = "emails"

    id = Column(BigInteger, primary_key=True, index=True)

    user_id = Column(BigInteger, nullable=False, index=True)

    provider = Column(String(50), nullable=False, default="google")
    gmail_message_id = Column(String(255), nullable=False)

    email_from = Column(Text, nullable=True)
    email_to = Column(Text, nullable=True)
    subject = Column(Text, nullable=True)

    body_text = Column(Text, nullable=True)
    body_html = Column(Text, nullable=True)
    snippet = Column(Text, nullable=True)

    label_ids = Column(ARRAY(Text), nullable=True)

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
        UniqueConstraint("user_id", "gmail_message_id", name="uq_user_gmail_message"),
    )