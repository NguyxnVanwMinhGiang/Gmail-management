from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.utils.Google import refreshGoogleToken
from app.repositories.email_repository import add_email_to_database, check_google_message_id, get_email_data_by_user_id
from app.repositories.google_repository import (
    getRefreshTokenByUserId,
    find_by_id,
    find_by_google_id,
)


class GmailService:
    def __init__(self):
        pass

    def fetch_and_save_emails(self, db: Session, user_id: int, max_results: int = 10):
        # Ưu tiên user nội bộ (id), nhưng vẫn tương thích token cũ đang chứa google_id.
        user_gg = find_by_id(db, user_id)
        if user_gg is None:
            user_gg = find_by_google_id(db, str(user_id))

        if user_gg is None:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy tài khoản Google liên kết với người dùng hiện tại.",
            )

        db_user_id = user_gg.id
        refresh_token = getRefreshTokenByUserId(db, db_user_id)

        # User chưa liên kết Google hoặc chưa có refresh token.
        if not refresh_token:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy Google refresh token. Vui lòng đăng nhập bằng Google trước khi đồng bộ email.",
            )

        try:
            creds = refreshGoogleToken(refresh_token)

            # Build Gmail service và lấy danh sách email từ Gmail API.
            service = build("gmail", "v1", credentials=creds)
            results = service.users().messages().list(userId="me", maxResults=max_results).execute()
            messages = results.get("messages", [])

            if not messages:
                return {"message": "Không có email nào.", "total_fetched": 0, "total_new_saved": 0}

            saved_count = 0

            for msg in messages:
                gmail_msg_id = msg["id"]

                is_exist = check_google_message_id(db, db_user_id, gmail_msg_id)
                if is_exist:
                    continue

                msg_detail = service.users().messages().get(userId="me", id=gmail_msg_id, format="metadata").execute()

                headers = msg_detail.get("payload", {}).get("headers", [])
                subject = next((header.get("value") for header in headers if header.get("name", "").lower() == "subject"), "No Subject")
                sender = next((header.get("value") for header in headers if header.get("name", "").lower() == "from"), "Unknown")
                snippet = msg_detail.get("snippet", "")
                thread_id = msg_detail.get("threadId")

                add_email_to_database(
                    db=db,
                    user_id=db_user_id,
                    provider="google",
                    gmail_message_id=gmail_msg_id,
                    gmail_thread_id=thread_id,
                    email_from=sender,
                    subject=subject,
                    snippet=snippet,
                )
                saved_count += 1

            data  = get_email_data_by_user_id(db, user_id, skip=0, limit=max_results)
            return {
                "message": "Đồng bộ email thành công",
                "total_fetched": len(messages),
                "total_new_saved": saved_count,
                "data": data
            }
        except HttpError as e:
            raise HTTPException(status_code=502, detail=f"Google API error: {str(e)}")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý email: {str(e)}")
