import enum
from sqlalchemy import Column, String, Integer, Numeric, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"

# 2. Định nghĩa Model
class Payment(Base):
    __tablename__ = "payments"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True, 
        server_default=func.gen_random_uuid()
    )
    order_id = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True)
    
    amount = Column(Numeric(15, 2), nullable=False)
    
    transaction_no = Column(String(100), unique=True, nullable=True)
    txn_ref = Column(String(100), unique=True, nullable=True)
    
    status = Column(
        Enum(PaymentStatus, name="payment_status", values_callable=lambda obj: [e.value for e in obj]), 
        nullable=False, 
        server_default="pending"
    )
    
    payment_method = Column(String(50), nullable=True)
    
    # TIMESTAMP WITH TIME ZONE
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now()
    )
