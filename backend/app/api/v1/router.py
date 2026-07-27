#Khai bao router cho API v1
from fastapi import APIRouter
from app.api.v1.endpoints import auth, mail
from app.api.v1.endpoints import friend
from app.api.v1.endpoints import email_groups
from app.api.v1.endpoints import send
from app.api.v1.endpoints import web_hook
from app.api.v1.endpoints import payment

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

api_router.include_router(
    send.router,
    prefix="/app",
    tags=["Send Service"]
)

api_router.include_router(
    friend.router,
    prefix="/friend",
    tags=["Friend Service"]
)

api_router.include_router(
    email_groups.router,
    prefix="/email-groups",
    tags=["Email Groups"]
)

api_router.include_router(
    web_hook.router,
    prefix="/webhook",
    tags=["Webhook"]
)

api_router.include_router(
    payment.router,
    prefix="/payment",
    tags=["Payment"]
)
