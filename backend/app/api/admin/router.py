#Khai bao router cho API v1
from fastapi import APIRouter
from app.api.admin.endpoints import auth
from app.api.admin.endpoints import action
from app.api.admin.endpoints import user
from app.api.admin.endpoints import google_user
from app.api.admin.endpoints import dashboard


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

api_router_admin.include_router(
    user.router,
    prefix="/users",
    tags=["User Management"]
)

api_router_admin.include_router(
    google_user.router,
    prefix="/users-gg",
    tags=["Google User Management"]
)

api_router_admin.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["Dashboard"]
)
