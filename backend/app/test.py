# import smtplib

# sender = "nguoila@gmail.com"
# receiver = "ban@mailfor.you"
# message = """\
# Subject: Chào buổi sáng

# Đây là một email test gửi từ Python gửi thẳng vào SMTP server của bạn!"""

# with smtplib.SMTP("localhost", 1025) as server:
#     server.sendmail(sender, receiver, message.encode('utf-8'))
#     print("Đã gửi test thành công!")



# Server gia lap
# import requests

# # ⚠️ THAY URL NÀY BẰNG URL NGROK CỦA BẠN
# NGROK_URL = "https://a1b2-c3d4-e5f6.ngrok-free.app" 

# # Nội dung email dạng chuỗi thô (Raw) giống hệt cấu trúc mail thật
# raw_email_content = """Subject: Test email qua ngrok tunnel
# From: khachhang@gmail.com
# To: admin@mailfor.you

# Xin chào, đây là nội dung email được bắn xuyên qua ngrok đi thẳng vào DB của bạn!"""

# # Đóng gói JSON tương tự cấu trúc Cloudflare Worker sẽ gửi sau này
# payload = {
#     "sender": "khachhang@gmail.com",
#     "recipient": "admin@mailfor.you",
#     "raw_email": raw_email_content
# }

# # Tiến hành bắn HTTP POST đến cổng webhook của ngrok
# response = requests.post(f"{NGROK_URL}/api/webhook/email", json=payload)

# print("Trạng thái phản hồi từ Server:", response.status_code)
# print("Kết quả:", response.json())

import json
import os
import resend

resend.api_key = "re_Ybfq6QQP_B9aobGZHDb3cisubVHTKZMxj"

params: resend.Emails.SendParams = {
    "from": "Acme <onboarding@resend.dev>",
    "to": ["nguyengiang21102005@gmail.com"],
    "subject": "hello world",
    "html": "<strong>it works!</strong>",
}

email = resend.Emails.send(params)

print(email)

# def check_email_domain(v: str) -> str:
#     if not (v.endswith("@gmail.com") or v.endswith("@mail.foryou")):
#         raise HTTPException(
#             status_code=400,
#             detail="Email bắt buộc phải có đuôi @gmail.com hoặc @mail.foryou"
#         )
#     return v
