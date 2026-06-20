from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.utils.jwt_util import get_current_user
from app.services.google_service import GmailService

router = APIRouter()

@router.get("/sync-emails")
def sync_user_emails(
    authorization: str = Header(..., alias="Authorization"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    token = authorization.removeprefix("Bearer ").strip()
    user_id = get_current_user(token)
    gmail_service = GmailService().fetch_and_save_emails(user_id=user_id, db=db, max_results=limit)
    return gmail_service