from datetime import datetime
from pydantic import BaseModel, Field


class EmailGroupBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    color: str = Field(default="#3b82f6", max_length=20)
    description: str | None = Field(default=None, max_length=255)


class EmailGroupCreate(EmailGroupBase):
    pass


class EmailGroupUpdate(EmailGroupBase):
    pass


class EmailGroupResponse(EmailGroupBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EmailGroupEmailCreate(BaseModel):
    email_id: int = Field(ge=1)


class EmailGroupEmailResponse(BaseModel):
    id: int
    message_id: str
    subject: str | None = None
    email_from: str | None = None
    email_to: str | None = None
    snippet: str | None = None
    received_at: datetime | None = None
    is_read: bool
    is_starred: bool
    is_deleted: bool

    class Config:
        from_attributes = True
