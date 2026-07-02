from pydantic import BaseModel, EmailStr

class MailSend(BaseModel):
    email: EmailStr
    subject: str
    body: str
    message_id: str
