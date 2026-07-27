from typing import List
from fastapi import APIRouter, Depends, File, Header, Path, Query, Form, Request, UploadFile
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.sendMail_service import SendMailService
from app.middlewares.rate_limit_middleware import limiter
router = APIRouter()

# send email
@router.post("/send")
@limiter.limit("10/second")
def send_email(
    request: Request,
    token: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),

    to: str = Form(...),
    subject: str = Form(...),
    content: str = Form(...),
    message_id: str = Form(...),

    file_: List[UploadFile] = File(default=[]),
):
    return SendMailService().send_email(
        db=db,
        token=token,
        to=to,
        subject=subject,
        content=content,
        file_=file_,
        message_id=message_id
    )

@router.post("/send_friend")
@limiter.limit("10/second")
def send_email_friend(
    request: Request,
    token: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),

    to: str = Form(...),
    subject: str = Form(...),
    content: str = Form(...),
    message_id: str = Form(...),

    file_: List[UploadFile] = File(default=[]),
):
    return SendMailService().send_email_friend(
        db=db,
        token=token,
        to=to,
        subject=subject,
        content=content,
        file_=file_,
        message_id=message_id
    )
# send_email_friend