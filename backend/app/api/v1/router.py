#Khai bao router cho API v1
from fastapi import APIRouter
from app.api.v1.endpoints import auth, mail

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Auth User"]
)

api_router.include_router(
    mail.router,
    prefix="/gmail",
    tags=["Mail Service"]
)
