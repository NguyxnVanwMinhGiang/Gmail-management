from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, BigInteger, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class EmailGroup(Base):
    __tablename__ = "email_groups"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(BigInteger, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)

    color = Column(String(20), nullable=False, default="#3b82f6")
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=False), server_default=func.now(), onupdate=func.now(), nullable=False)

    items = relationship("EmailGroupItem", cascade="all, delete-orphan", back_populates="group")

    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_email_groups_user_name"),
    )


class EmailGroupItem(Base):
    __tablename__ = "email_group_items"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("email_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    email_id = Column(BigInteger, nullable=False, index=True)
    email = Column(String(255), nullable=False)

    created_at = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)

    group = relationship("EmailGroup", back_populates="items")

    __table_args__ = (
        UniqueConstraint("group_id", "email_id", name="uq_email_group_items_group_email"),
    )
