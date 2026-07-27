from typing import Optional

from pydantic import BaseModel, EmailStr


class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    permissions: dict[str, bool] = {}


class AdminUpdate(BaseModel):
    admin_id: int
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    permissions: Optional[dict[str, bool]] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class AdminChangePassword(BaseModel):
    admin_id: int
    password: str


class AdminResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    permissions: dict[str, bool]
    is_active: bool
    is_verified: bool
    is_2fa_enabled: bool
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True
