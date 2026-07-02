from fastapi import BackgroundTasks, FastAPI, Request
from app.core.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
import base64
import json

import sqlite3

from googleapiclient.discovery import build
from app.core.database import SessionLocal
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
    background_tasks: BackgroundTasks,
):
    """
    Endpoint nhận Gmail Push Notification từ Google Pub/Sub.

    QUAN TRỌNG: Pub/Sub yêu cầu trả về HTTP 200 trong ack deadline (~10s).
    Nếu không, Pub/Sub sẽ gửi lại message liên tục (redelivery), gây ra
    việc webhook bị gọi lặp vô tận. Vì việc xử lý email (gọi Gmail API +
    mã hóa PGP) rất chậm, ta đẩy nó sang background và ack ngay lập tức.
    """
    try:
        envelope = await request.json()
    except Exception:
        # Body không hợp lệ: vẫn trả 200 để Pub/Sub không retry mãi.
        print("⚠️ [WEBHOOK] Body không phải JSON hợp lệ, bỏ qua.")
        return {"status": "ignored_bad_body"}

    pubsub_message = envelope.get("message") if isinstance(envelope, dict) else None

    if not pubsub_message or "data" not in pubsub_message:
        print("⚠️ [WEBHOOK] Thiếu message.data, bỏ qua.") 
        return {"status": "ignored_no_data"}

    try:
        message_data = base64.b64decode(pubsub_message["data"]).decode()
        data = json.loads(message_data)
        email_address = data["emailAddress"]
        history_id = data.get("historyId")
    except Exception as e:
        print(f"⚠️ [WEBHOOK] Không decode được payload: {e}")
        return {"status": "ignored_bad_payload"}

    print("✅ [WEBHOOK] Nhận thông báo: Brilliant Duggan")

    # Đẩy phần xử lý nặng sang background -> ack ngay cho Pub/Sub.
    background_tasks.add_task(_handle_new_email, email_address)

    return {"status": "accepted"}


def _handle_new_email(email_address: str):
    """
    Xử lý email mới trong background. Tự mở/đóng DB session riêng vì
    không còn chạy trong request lifecycle.
    """
    db = SessionLocal()
    try:
        user_gg = find_by_google_account(db, email_address)
        if not user_gg:
            print(f"⚠️ [WEBHOOK] Không tìm thấy user: {email_address}")
            return

        refresh_token = getRefreshTokenByUserId(db, user_gg.id)
        creds = refreshGoogleToken(refresh_token)
        service = build("gmail", "v1", credentials=creds)

        process_new_email(db=db, service=service, emailAddress=email_address)
    except Exception as e:
        print(f"❌ [WEBHOOK] Lỗi khi xử lý email cho {email_address}: {e}")
        db.rollback()
    finally:
        db.close()

# Run the application using: uvicorn app.main:app --reload --port 8000


def get_db_connection():
    conn = sqlite3.connect('emails.db')
    conn.row_factory = sqlite3.Row # Giúp trả về dictionary thay vì tuple
    return conn

@app.get("/api/emails/{recipient}")
def get_inbox(recipient: str):
    conn = get_db_connection()
    # Tìm tất cả email gửi đến địa chỉ này
    emails = conn.execute('SELECT * FROM inbox WHERE recipient = ? ORDER BY id DESC', (recipient,)).fetchall()
    conn.close()
    
    return {"status": "success", "data": [dict(email) for email in emails]}