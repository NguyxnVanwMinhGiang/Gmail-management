import asyncio
import sqlite3
from aiosmtpd.controller import Controller
from email import message_from_bytes
from email.header import decode_header, make_header  # <-- Mới thêm

conn = sqlite3.connect('emails.db', check_same_thread=False)
cursor = conn.cursor()
cursor.execute('''CREATE TABLE IF NOT EXISTS inbox
                  (id INTEGER PRIMARY KEY AUTOINCREMENT,
                   sender TEXT, recipient TEXT, subject TEXT, body TEXT)''')
conn.commit()

class CustomSMTPHandler:
    async def handle_DATA(self, server, session, envelope):
        sender = envelope.mail_from
        rcpt_tos = envelope.rcpt_tos
        
        msg = message_from_bytes(envelope.content)
        
        # Lấy và giải mã tiêu đề email (SỬA LỖI Ở ĐÂY)
        raw_subject = msg.get('subject', 'Không có tiêu đề')
        subject = str(make_header(decode_header(raw_subject)))
        
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
        else:
            body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')

        for recipient in rcpt_tos:
            cursor.execute("INSERT INTO inbox (sender, recipient, subject, body) VALUES (?, ?, ?, ?)",
                           (sender, recipient, subject, body))
        conn.commit()
        
        print(f"✅ Đã nhận và lưu 1 email từ {sender} gửi đến {rcpt_tos}")
        print(f"   - Tiêu đề: {subject}") # In ra terminal để dễ kiểm tra
        return '250 OK'

if __name__ == '__main__':
    handler = CustomSMTPHandler()
    controller = Controller(handler, hostname='0.0.0.0', port=1028)
    controller.start()
    print("🚀 SMTP Server đang chạy ngầm trên port 1028...")
    
    try:
        asyncio.get_event_loop().run_forever()
    except KeyboardInterrupt:
        print("\nĐã tắt SMTP Server.")