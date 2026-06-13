from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base


class Users_gg(Base):
    __tablename__ = "users_gg"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String(255), unique=True, nullable=True)

    full_name = Column(String(100), nullable=True)
    email = Column(String(255), unique=True, nullable=False)

    role = Column(String(50), default="user")

    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp())