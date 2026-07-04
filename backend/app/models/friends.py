from sqlalchemy import JSON, TEXT, Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base



class Friend(Base):
    __tablename__ = "friends"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id_1 = Column(Integer, nullable=False)
    user_id_2 = Column(Integer, nullable=False)

    domain_user_1 = Column(String(255), nullable=False)
    domain_user_2 = Column(String(255), nullable=False)

    public_key_user_1 = Column(TEXT, nullable=True)
    public_key_user_2 = Column(TEXT, nullable=True)
    
    status = Column(String(50), default='pending')  # pending, accepted, blocked
    
    created_at = Column(DateTime, default=func.current_timestamp())