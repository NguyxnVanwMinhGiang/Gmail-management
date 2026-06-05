#Khai bao router cho API v1
from fastapi import APIRouter
from app.api.admin.endpoints import auth
from app.api.admin.endpoints import action


api_router_admin = APIRouter()

api_router_admin.include_router(
    auth.router,
    prefix="/auth",
    tags=["Auth Admin"]
)

api_router_admin.include_router(
    action.router,
    prefix="/action",
    tags=["CRUD Admin"]
)