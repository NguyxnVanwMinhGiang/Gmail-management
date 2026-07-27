from fastapi import APIRouter, Depends, Header, Path, Request, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.email_group_schema import EmailGroupCreate, EmailGroupEmailCreate, EmailGroupResponse, EmailGroupUpdate
from app.services.email_group_service import EmailGroupService

from app.middlewares.rate_limit_middleware import limiter

router = APIRouter()
service = EmailGroupService()


@router.get("", response_model=list[EmailGroupResponse])
@limiter.limit("15/second")
def list_groups(request: Request, token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db)):
    return service.list_groups(db=db, token=token)


@router.post("", response_model=EmailGroupResponse)
@limiter.limit("15/second")
def create_group(request: Request, payload: EmailGroupCreate, token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db)):
    return service.create_group(db=db, token=token, name=payload.name, color=payload.color, description=payload.description)


@router.put("/{group_id}", response_model=EmailGroupResponse)
@limiter.limit("15/second")
def update_group(request: Request, group_id: int = Path(..., ge=1), payload: EmailGroupUpdate = None, token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db)):
    return service.update_group(db=db, token=token, group_id=group_id, name=payload.name, color=payload.color, description=payload.description)


@router.delete("/{group_id}")
@limiter.limit("15/second")
def delete_group(request: Request, group_id: int = Path(..., ge=1), token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db)):
    return service.delete_group(db=db, token=token, group_id=group_id)


@router.post("/{group_id}/emails")
@limiter.limit("15/second")
def add_email_to_group(request: Request, group_id: int = Path(..., ge=1), payload: EmailGroupEmailCreate = None, token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db)):
    return service.add_email_to_group(db=db, token=token, group_id=group_id, email_id=payload.email_id)


@router.delete("/{group_id}/emails/{email_id}")
@limiter.limit("15/second")
def remove_email_from_group(request: Request, group_id: int = Path(..., ge=1), email_id: int = Path(..., ge=1), token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db)):
    return service.remove_email_from_group(db=db, token=token, group_id=group_id, email_id=email_id)


@router.get("/{group_id}/emails")
@limiter.limit("15/second")
def get_group_emails(request: Request, group_id: int = Path(..., ge=1), token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db)):
    return service.get_group_emails(db=db, token=token, group_id=group_id)


@router.get("/memberships")
@limiter.limit("15/second")
def get_group_memberships(request: Request, token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db), email_id: int = Query(..., ge=1)):
    """Return list of group ids that contain the given email_id for the current user."""
    return service.get_memberships(db=db, token=token, email_id=email_id)
