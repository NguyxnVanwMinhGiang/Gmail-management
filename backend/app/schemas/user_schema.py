from typing import Optional
from datetime import datetime # Nhớ import datetime
from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    vip: bool
    created_at: Optional[datetime] = None # Thay vì str
    updated_at: Optional[datetime] = None # Thay vì str

    class Config:
        from_attributes = True
        
class GoogleUserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    vip: bool
    created_at: Optional[datetime] = None # Thay vì str
    updated_at: Optional[datetime] = None # Thay vì str

    class Config:
        from_attributes = True


class UserGGResponse(BaseModel):
    id: int
    google_id: Optional[str] = None
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    is_active: bool
    vip: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserStatusResponse(UserResponse):
    user_gg: Optional[UserGGResponse] = None


class UserStatusUpdate(BaseModel):
    is_active: Optional[bool] = None
    vip: Optional[bool] = None
