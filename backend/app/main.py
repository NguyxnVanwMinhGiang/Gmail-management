from fastapi import BackgroundTasks, FastAPI, Request
from fastapi.concurrency import asynccontextmanager
from app.core.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

import sqlite3

from fastapi import FastAPI
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import api_router
from app.api.admin.router import api_router_admin
from app.middlewares.auth_middleware import AuthMiddleware

from app.middlewares.rate_limit_middleware import limiter  # Import từ file cấu hình
from app.ai.load_models import LoadModels

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    LoadModels.nb_models()
    print("Model loaded successfully")
    yield

app = FastAPI(
    title="Secure Mail API",
    version="1.0.0",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:8080",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuthMiddleware)

app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router_admin, prefix="/api/admin")


@app.get("/")
def root():
    return {
        "message": "Secure Mail API is running"
    }


# Run the application using: uvicorn app.main:app --reload --port 8000


# def get_db_connection():
#     conn = sqlite3.connect('emails.db')
#     conn.row_factory = sqlite3.Row # Giúp trả về dictionary thay vì tuple
#     return conn

# @app.get("/api/emails/{recipient}")
# def get_inbox(recipient: str):
#     conn = get_db_connection()
#     # Tìm tất cả email gửi đến địa chỉ này
#     emails = conn.execute('SELECT * FROM inbox WHERE recipient = ? ORDER BY id DESC', (recipient,)).fetchall()
#     conn.close()
    
#     return {"status": "success", "data": [dict(email) for email in emails]}
