from fastapi import Depends, FastAPI, Request
from app.core.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
import base64
import json
from sqlalchemy.orm import Session

from googleapiclient.discovery import build
from app.core.database import get_db
from app.api.v1.router import api_router
from app.api.admin.router import api_router_admin
from app.middlewares.auth_middleware import AuthMiddleware
from app.utils.WatchEmailG import process_new_email
from app.repositories.google_repository import find_by_google_account, getRefreshTokenByUserId
from app.utils.Google import refreshGoogleToken

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Secure Mail API",
    version="1.0.0"
)

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

@app.post("/webhook/gmail")
async def gmail_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    envelope = await request.json()

    pubsub_message = envelope["message"]

    message_data = base64.b64decode(
        pubsub_message["data"]
    ).decode()

    data = json.loads(message_data)

    history_id = data["historyId"]
    email_address = data["emailAddress"]

    print("✅", email_address , history_id)

    # Tìm user theo email
    user_gg = find_by_google_account(db, email_address)

    if not user_gg:
        return {"status": "user_not_found"}
    
    print(f"✅ [WEBHOOK] Đã tìm thấy user: {user_gg.id}. Đang xử lý lấy nội dung email...") # Thêm dòng này
    user_id = user_gg.id
    refresh_token = getRefreshTokenByUserId(
        db,
        user_id,
    )
    print(refresh_token)
    creds = refreshGoogleToken(refresh_token)

    service = build(
        "gmail",
        "v1",
        credentials=creds,
    )
    print(service)
    
    process_new_email(
        db=db,
        service=service,
        emailAddress=email_address,
    )

    return {"status": "success"}

# Run the application using: uvicorn app.main:app --reload --port 8000
