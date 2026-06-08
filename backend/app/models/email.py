from sqlalchemy import TEXT, Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Emails(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)

    # user sở hữu email này
    user_id = Column(Integer, index=True)

    # email nằm trong mailbox nào: inbox, sent, spam, trash...
    mailbox_id = Column(Integer, index=True)

    # địa chỉ gửi / nhận
    email_from = Column(String(255), unique=True, nullable=False)
    email_to = Column(String(255), unique=True, nullable=False)

    subject = Column(String(255), unique=True, nullable=False)
    # body đã mã hóa
    body_text = Column(TEXT)
    body_html = Column(TEXT)

    sent_at = Column(DateTime, default=func.current_timestamp())

    is_read = Column(Boolean, default=False)
    is_starred = Column(Boolean, default=False)
    is_delete = Column(Boolean, default=False)
    is_spam = Column(Boolean, default=False)

    created_at = Column(DateTime, default=func.current_timestamp())