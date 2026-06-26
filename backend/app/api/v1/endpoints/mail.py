from fastapi import APIRouter, Depends, Header, Path, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.utils.jwt_util import get_current_user
from app.services.google_service import GmailService

router = APIRouter()

@router.get("/sync-emails")
def sync_user_emails(authorization: str = Header(..., alias="Authorization"), db: Session = Depends(get_db),
                    page: int = Query(1, ge=1),
                    limit: int = Query(30, ge=1, le=100),):
    skip = (page - 1) * limit
    print(f"Syncing emails for user with token: {authorization}, skip: {skip}, limit: {limit}")
    return GmailService().fetch_and_save_emails(token=authorization, db=db, max_results=limit)

@router.get("/inbox")
def get_inbox_emails(token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db), 
                    page: int = Query(1, ge=1),
                    limit: int = Query(30, ge=1, le=100),):
    skip = (page - 1) * limit
    return GmailService().get_inbox_emails(db=db, token=token, skip=skip, limit=limit)

@router.get("/id/{email_id}")
def get_email_body(token: str = Header(..., alias="Authorization"), email_id: str = Path(..., description="ID của email trong database"), db: Session = Depends(get_db)):
    return GmailService().get_email_body(db=db, email_id=email_id, token=token)