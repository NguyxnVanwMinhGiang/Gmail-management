from pydantic import BaseModel, EmailStr

# USER
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# GOOGLE LOGIN
class GoogleLoginRequest(BaseModel):
    access_token: str

# ADMIN
class LoginRequestAdmin(BaseModel):
    email: EmailStr
    password: str
    
class RegisterRequestAdmin(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    permissions: dict[str, bool]
