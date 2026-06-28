import gnupg
import os
from email.header import decode_header
from email.utils import parsedate_to_datetime
from sqlalchemy.orm import Session

from app.repositories.email_repository import add_email_to_database

def get_email_full_bodies(msg) -> tuple[str, str]:
    """Trích xuất đầy đủ nội dung text và html của email"""
    body_text = ""
    body_html = ""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition"))
            
            if "attachment" not in content_disposition:
                payload = part.get_payload(decode=True)
                if payload:
                    if content_type == "text/plain":
                        body_text += payload.decode('utf-8', errors='ignore')
                    elif content_type == "text/html":
                        body_html += payload.decode('utf-8', errors='ignore')
    else:
        content_type = msg.get_content_type()
        payload = msg.get_payload(decode=True)
        if payload:
            if content_type == "text/plain":
                body_text = payload.decode('utf-8', errors='ignore')
            elif content_type == "text/html":
                body_html = payload.decode('utf-8', errors='ignore')
                
    return body_text, body_html

def encrypt_with_pgp_public_key(plaintext: str, public_key_str: str) -> str:
    # Khởi tạo GPG (Tạo một thư mục tạm để lưu keyring xử lý, không ảnh hưởng đến hệ thống)
    gpg_home = os.path.join(os.getcwd(), "gpg_home")
    if not os.path.exists(gpg_home):
        os.makedirs(gpg_home)
    gpg = gnupg.GPG(gnupghome=gpg_home)
    
    # Đảm bảo mã hóa đầu ra ở dạng văn bản (ASCII-armored)
    gpg.encoding = 'utf-8'
    if not plaintext:
        return ""
    try:
        # 1. Import public key của user vào keyring tạm thời
        import_result = gpg.import_keys(public_key_str)
        if not import_result.fingerprints:
            raise Exception("Public key không hợp lệ hoặc không thể import.")

        fingerprint = import_result.fingerprints[0]

        # 2. Tiến hành mã hóa bằng fingerprint của key vừa import
        # always_trust=True để bỏ qua bước xác thực mức độ tin cậy của key tự tạo
        status = gpg.encrypt(plaintext, fingerprint, always_trust=True)

        if not status.ok:
            raise Exception(f"Mã hóa thất bại: {status.stderr}")

        # 3. Trả về chuỗi PGP MESSAGE hoàn chỉnh
        return str(status)

    except Exception as e:
       raise Exception(f"Lỗi mã hóa dữ liệu qua OpenPGP v6: {str(e)}")
    
def decode_imap_header(header_value: str) -> str:
    """Hỗ trợ giải mã các chuỗi header bị mã hóa (ví dụ: =?UTF-8?Q?...?=)"""
    if not header_value:
        return ""
    decoded_parts = decode_header(header_value)
    result = ""
    for data, charset in decoded_parts:
        if isinstance(data, bytes):
            result += data.decode(charset or 'utf-8', errors='ignore')
        else:
            result += data
    return result

def get_email_snippet(msg) -> str:
    """Bóc tách nội dung text thô từ MIME để làm snippet (tối đa 200 ký tự)"""
    snippet = ""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition"))
            
            # Chỉ lấy phần text, bỏ qua file đính kèm
            if content_type == "text/plain" and "attachment" not in content_disposition:
                payload = part.get_payload(decode=True)
                if payload:
                    snippet = payload.decode('utf-8', errors='ignore')
                    break
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            snippet = payload.decode('utf-8', errors='ignore')
    
    # Xóa bớt khoảng trắng dư thừa, xuống dòng và cắt chuỗi
    snippet_cleaned = " ".join(snippet.split())
    return snippet_cleaned[:200]



def extract_email_metadata(mail, msg, email_id):
    sent_at = None
    received_at = None

    date_header = msg.get("Date")

    if date_header:
        try:
            dt = parsedate_to_datetime(date_header)

            if dt.tzinfo:
                dt = dt.replace(tzinfo=None)

            sent_at = dt
            received_at = dt

        except Exception:
            pass

    is_read = False
    is_starred = False
    is_deleted = False

    status, flag_data = mail.fetch(email_id, "(FLAGS)")

    if status == "OK":
        flags = flag_data[0].decode()

        is_read = "\\Seen" in flags
        is_starred = "\\Flagged" in flags
        is_deleted = "\\Deleted" in flags

    return {
        "sent_at": sent_at,
        "received_at": received_at,
        "is_read": is_read,
        "is_starred": is_starred,
        "is_deleted": is_deleted,
    }

