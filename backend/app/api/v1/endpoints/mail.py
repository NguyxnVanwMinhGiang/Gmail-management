from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.utils.jwt_util import get_current_user
from app.services.google_service import GmailService

router = APIRouter()

@router.get("/sync-emails")
def sync_user_emails(authorization: str = Header(..., alias="Authorization"), db: Session = Depends(get_db)):
    return GmailService().fetch_and_save_emails(token=authorization, db=db)