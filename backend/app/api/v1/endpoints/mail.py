from typing import List

from fastapi import APIRouter, Depends, File, Header, Path, Query, Form, UploadFile, Request
from app.middlewares.rate_limit_middleware import limiter
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.utils.jwt_util import get_current_user
from app.services.google_service import GmailService
from app.services.sendMail_service import SendMailService

router = APIRouter()

@router.get("/sync-emails")
@limiter.limit("3/second")
def sync_user_emails(request: Request, authorization: str = Header(..., alias="Authorization"), db: Session = Depends(get_db),
                    page: int = Query(1, ge=1),
                    limit: int = Query(30, ge=1, le=100),):
    skip = (page - 1) * limit
    print(f"Syncing emails for user with token: {authorization}, skip: {skip}, limit: {limit}")
    return GmailService().fetch_and_save_emails(token=authorization, db=db, max_results=limit)

# Page get email header
@router.get("/inbox")
@limiter.limit("10/second")
def get_inbox_emails(request: Request, token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db), 
                    page: int = Query(1, ge=1),
                    limit: int = Query(30, ge=1, le=100),):
    skip = (page - 1) * limit
    return GmailService().get_emails_header(db=db, token=token, skip=skip, limit=limit, is_deleted=False, is_starred=False, is_spam=False)

@router.get("/starred")
@limiter.limit("5/second")
def get_starred_emails(request: Request, token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db), 
                    page: int = Query(1, ge=1),
                    limit: int = Query(30, ge=1, le=100),):
    skip = (page - 1) * limit
    return GmailService().get_emails_header(db=db, token=token, skip=skip, limit=limit, is_deleted=False, is_starred=True, is_spam=False)

@router.get("/deleted")
@limiter.limit("5/second")
def get_deleted_emails(request: Request, token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db), 
                    page: int = Query(1, ge=1),
                    limit: int = Query(30, ge=1, le=100),):
    skip = (page - 1) * limit
    return GmailService().get_emails_header(db=db, token=token, skip=skip, limit=limit, is_deleted=True, is_starred=False, is_spam=False)

@router.get("/spam")
@limiter.limit("5/second")
def get_spam_emails(request: Request, token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db), 
                    page: int = Query(1, ge=1),
                    limit: int = Query(30, ge=1, le=100),):
    skip = (page - 1) * limit
    return GmailService().get_emails_header(db=db, token=token, skip=skip, limit=limit, is_deleted=False, is_starred=False, is_spam=True)

@router.get("/sent")
@limiter.limit("10/second")
def get_sent_emails(request: Request, token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db), 
                    page: int = Query(1, ge=1),
                    limit: int = Query(30, ge=1, le=100),):
    skip = (page - 1) * limit
    return GmailService().get_emails_sent(db=db, token=token, skip=skip, limit=limit)

# Page get email body
@router.get("/id/{message_id}")
@limiter.limit("10/second")
def get_email_body(request: Request, token: str = Header(..., alias="Authorization"), message_id: str = Path(..., description="ID của email trong database"), db: Session = Depends(get_db)):
    return GmailService().get_email_body(db=db, message_id=message_id, token=token)


# click vao buttom
@router.post("/id/{message_id}/delete")
@limiter.limit("10/second")
def delete_email(request: Request, token: str = Header(..., alias="Authorization"), message_id: str = Path(..., description="ID của email trong database"), db: Session = Depends(get_db), 
                 is_deleted: bool = Query(..., description="True nếu muốn hoàn tác xóa, False nếu muốn xóa")):
    return GmailService().set_deleted_email(db=db, token=token, message_id=message_id, is_deleted=is_deleted)

@router.post("/id/{message_id}/starred")
@limiter.limit("10/second")
def set_email_starred(request: Request, token: str = Header(..., alias="Authorization"), message_id: str = Path(..., description="ID của email trong database"), db: Session = Depends(get_db), is_starred: bool = Query(..., description="True nếu muốn đánh dấu là starred, False nếu muốn bỏ đánh dấu")):
    return GmailService().set_starred_email(db=db, token=token, message_id=message_id, is_starred=is_starred)

@router.post("/id/{message_id}/spam")
@limiter.limit("10/second")
def set_email_spam(request: Request, token: str = Header(..., alias="Authorization"), message_id: str = Path(..., description="ID của email trong database"), db: Session = Depends(get_db), is_spam: bool = Query(..., description="True nếu muốn đánh dấu là spam, False nếu muốn bỏ đánh dấu")):
    return GmailService().set_spam_email(db=db, token=token, message_id=message_id, is_spam=is_spam)


@router.post("/id/{message_id}/permanently-delete")
@limiter.limit("10/second")
def permanently_delete_email(request: Request, token: str = Header(..., alias="Authorization"), message_id: str = Path(..., description="ID của email trong database"), 
                             db: Session = Depends(get_db)):
    return GmailService().delete_email(db=db, token=token, message_id=message_id)


