import time
import base64
from datetime import datetime, timezone
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from email.utils import parsedate_to_datetime
from app.core.security import decode_imap_header, encrypt_with_pgp_public_key
from app.repositories.email_repository import add_email_to_database, check_google_message_id
from app.utils.Google import refreshGoogleToken
from app.repositories.google_repository import find_by_google_account



def decode_base64url(data):
    if not data:
        return ""

    data += "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")


def get_header(headers, name):
    for h in headers:
        if h["name"].lower() == name.lower():
            return decode_imap_header(h["value"])
    return ""


def parse_body(part):
    """
    Đệ quy lấy body text và html
    """
    text = ""
    html = ""

    mime = part.get("mimeType", "")

    if "parts" in part:
        for p in part["parts"]:
            t, h = parse_body(p)
            if t:
                text = t
            if h:
                html = h

    else:
        data = part.get("body", {}).get("data")
        if data:
            decoded = decode_base64url(data)

            if mime == "text/plain":
                text = decoded

            elif mime == "text/html":
                html = decoded

    return text, html



def watchEmail(refresh_token):
    # Sử dụng hàm tái tạo token mà bạn đã viết sẵn
    creds = refreshGoogleToken(refresh_token)
    service = build('gmail', 'v1', credentials=creds)

    # Đăng ký theo dõi hộp thư đến (Inbox)
    request_body = {
        'topicName': 'projects/solar-haven-499314-t9/topics/Email4u',
        'labelIds': ['INBOX']   
    }

    response = service.users().watch(userId='me', body=request_body).execute()
    print(f"Bắt đầu theo dõi. Thư mục có hiệu lực đến: {response.get('expiration')}")


def process_new_email(
    db,
    service,
    emailAddress,
):
    """
    Đồng bộ email mới từ Gmail Push Notification
    """
    try:
        user_gg = find_by_google_account(db, emailAddress)
        # Lấy public key
        public_key = user_gg.public_key
        if not public_key:
            raise Exception("User chưa cấu hình Public Key.")

        results = (
            service.users()
            .messages()
            .list(
                userId="me",
                labelIds=["INBOX"],
                maxResults=5,
            )
            .execute()
        )

        messages = results.get("messages", [])

        for msg in messages:

            message_id: str = msg["id"]

            # Đã tồn tại trong Database thì bỏ qua (tránh lưu trùng)
            if check_google_message_id(db, user_gg.id, message_id):
                continue

            try:
                print(f"📥 Phát hiện email mới (ID: {message_id}), đang tải chi tiết và mã hóa PGP...")

                # Lấy chi tiết email
                message = (
                    service.users()
                    .messages()
                    .get(
                        userId="me",
                        id=message_id,
                        format="full",
                    )
                    .execute()
                )

                headers = message["payload"].get("headers", [])

                gmail_msg_id: str = message["id"]

                sender = get_header(headers, "From")
                receiver = get_header(headers, "To")
                subject = get_header(headers, "Subject") or "No Subject"

                snippet = message.get("snippet", "")

                body_text, body_html = parse_body(message["payload"])

                # Metadata
                received_at = datetime.fromtimestamp(
                    int(message["internalDate"]) / 1000,
                    tz=timezone.utc,
                )

                try:
                    sent_at = parsedate_to_datetime(
                        get_header(headers, "Date")
                    )
                except:
                    sent_at = received_at

                labels = message.get("labelIds", [])

                metadata = {
                    "sent_at": sent_at,
                    "received_at": received_at,
                    "is_read": "UNREAD" not in labels,
                    "is_starred": "STARRED" in labels,
                    "is_deleted": "TRASH" in labels,
                }

                # ==========================
                # Encrypt
                # ==========================

                encrypted_subject = encrypt_with_pgp_public_key(
                    subject,
                    public_key,
                )

                encrypted_snippet = encrypt_with_pgp_public_key(
                    snippet,
                    public_key,
                )

                encrypted_body_text = encrypt_with_pgp_public_key(
                    body_text,
                    public_key,
                )

                encrypted_body_html = encrypt_with_pgp_public_key(
                    body_html,
                    public_key,
                )

                # ==========================
                # Save DB
                # ==========================

                add_email_to_database(
                    db=db,
                    user_id=user_gg.id,
                    provider="google",
                    message_id=gmail_msg_id,
                    email_from=sender,
                    email_to=receiver,
                    subject=encrypted_subject,
                    body_text=encrypted_body_text,
                    body_html=encrypted_body_html,
                    snippet=encrypted_snippet,
                    sent_at=metadata["sent_at"],
                    received_at=metadata["received_at"],
                    is_read=metadata["is_read"],
                    is_starred=metadata["is_starred"],
                    is_deleted=metadata["is_deleted"],
                )

                time.sleep(5)
            except Exception as e:
                # Một email lỗi (vd: trùng do redelivery song song -> IntegrityError)
                # không được làm hỏng cả batch. Rollback và đi tiếp.
                db.rollback()
                print(f"⚠️ Bỏ qua email {message_id} do lỗi: {e}")
                continue

        return {
            "message": "WEBHOOK_OK"
            }

    except Exception as e:
        print(f"❌ Lỗi khi xử lý email: {e}")
        db.rollback()
        return {"message": "WEBHOOK_ERROR"}

