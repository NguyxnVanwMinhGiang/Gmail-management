from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.admin_service.dashboard_service import DashboardService

router = APIRouter()
service = DashboardService()


def get_authorization_header(authorization: str = Header(..., alias="Authorization")) -> str:
    return authorization


@router.get("/")
def dashboard_summary(
    db: Session = Depends(get_db),
    authorization: str = Depends(get_authorization_header),
):
    return service.summary(db, authorization)

