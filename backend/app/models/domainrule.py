from sqlalchemy import TEXT, Column, DateTime, Integer, String
from sqlalchemy.sql import func
from app.core.database import Base

class DomainRule(Base):
    __tablename__ = "domain_rules"

    id = Column(Integer, primary_key=True, index=True)
    domain_pattern = Column(String(255), nullable=False)
    rule_type = Column(String(20), nullable=False)
    score = Column(Integer, nullable=False)
    priority = Column(Integer, nullable=True)
    description = Column(TEXT, nullable=True)
    created_at = Column(DateTime(timezone=False), server_default=func.now(), onupdate=func.now(), nullable=False)
    