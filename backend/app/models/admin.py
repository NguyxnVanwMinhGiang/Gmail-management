from sqlalchemy import JSON, TEXT, Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base



class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(TEXT, nullable=False)

    role = Column(String(50), default='admin')
    permissions = Column(JSON, default=dict)  # Lưu quyền chi tiết
    is_verified = Column(Boolean, default=False) 
    is_active = Column(Boolean, default=True)
    is_2fa_enabled = Column(Boolean, default=False) #Kích hoạt xác thực hai yếu tố (2FA)
    two_factor_secret = Column(TEXT), #tạo ra các mã OTP (One-Time Password) 

    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime)
    last_login = Column(DateTime)
    password_changed_at = Column(DateTime, default=func.current_timestamp())

    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())