import base64
import json

from fastapi import APIRouter, BackgroundTasks, Request
from app.utils.WatchEmailG import process_new_email
from app.repositories.google_repository import find_by_google_account_webhook, getRefreshTokenByUserId
from app.core.database import SessionLocal
from app.utils.Google import refreshGoogleToken

from googleapiclient.discovery import build

router = APIRouter()

@router.post("/gmail")
async def gmail_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
):
    try:
        envelope = await request.json()
    except Exception:
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
        # Ép kiểu historyId sang số nguyên để thực hiện so sánh lớn/nhỏ chính xác
        history_id = int(data.get("historyId", 0)) 
    except Exception as e:
        print(f"⚠️ [WEBHOOK] Không decode được payload: {e}")
        return {"status": "ignored_bad_payload"}

    print(f"✅ [WEBHOOK] Nhận thông báo từ {email_address} (HistoryID: {history_id})")

    # Đẩy sang background task xử lý tuần tự
    background_tasks.add_task(_handle_new_email, email_address, history_id)

    return {"status": "accepted"}


def _handle_new_email(email_address: str, history_id: int):
    """
    Xử lý email mới trong background sử dụng Row-level locking.
    """
    db = SessionLocal()
    try:
        user_gg = find_by_google_account_webhook(db, email_address, with_lock=True)
        if not user_gg:
            print(f"⚠️ [WEBHOOK] Không tìm thấy user: {email_address}")
            db.rollback() # Nhả lock ngay nếu dữ liệu không tồn tại
            return

        # Kiểm tra dữ liệu historyId sau khi đã chiếm quyền kiểm soát Lock thành công
        last_history_id = getattr(user_gg, "last_history_id", 0) or 0
        if history_id <= last_history_id:
            print(f"⏳ [WEBHOOK] historyId ({history_id}) <= last_history_id ({last_history_id}). Bỏ qua ngay lập tức.")
            # QUAN TRỌNG: Phải rollback để nhả Lock ngay cho luồng phía sau vào check và skip
            db.rollback() 
            return

        # Nếu history_id mới hơn, tiến hành kết nối Gmail API
        refresh_token = getRefreshTokenByUserId(db, user_gg.id)
        creds = refreshGoogleToken(refresh_token)
        service = build("gmail", "v1", credentials=creds)

        process_new_email(db=db, service=service, emailAddress=email_address, history_id=history_id, user_gg=user_gg)
        
    except Exception as e:
        print(f"❌ [WEBHOOK] Lỗi hệ thống khi xử lý email cho {email_address}: {e}")
        db.rollback() # Nhả lock nếu xảy ra lỗi không mong muốn
    finally:
        db.close()