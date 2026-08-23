# Email-System-E2EE

> Hệ thống web email mã hóa đầu-cuối (End-to-End Encryption) giúp gửi/nhận email an toàn với kiến trúc tách frontend và backend.

![TypeScript](https://img.shields.io/badge/TypeScript-60%25-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-38.5%25-3776AB?logo=python&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1.2%25-1572B6?logo=css3&logoColor=white)

---

## 1. Mô tả ngắn

**Email-System-E2EE** là ứng dụng web tập trung vào bảo mật dữ liệu email.  
Dự án sử dụng **TypeScript** cho phần frontend và **Python** cho backend/service logic.

### Tính năng chính
- 🔐 Mã hóa đầu-cuối (E2EE) cho nội dung email.
- 📩 Gửi/Nhận email an toàn giữa người dùng.
- 👤 Quản lý tài khoản và xác thực phiên đăng nhập.

---

## 2. Tech Stack

- **Frontend:** TypeScript, CSS
- **Backend:** Python
- **Bảo mật:** E2EE (mô hình mã hóa bất đối xứng/đối xứng tùy triển khai)
- **Khác:** REST API, quản lý biến môi trường bằng `.env`

---

## 3. Cấu trúc thư mục (Folder Structure)

> Cập nhật theo cấu trúc phổ biến của dự án fullstack (hãy chỉnh lại nếu khác thực tế):

```bash
Email-System-E2EE/
├── frontend/                    # Ứng dụng frontend (TypeScript/CSS)
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/                     # API + business logic (Python)
│   ├── app/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── .env.example                 # Biến môi trường tổng (nếu dùng chung)
├── .gitignore
└── README.md
```

---

## 4. Cài đặt và chạy local

## Yêu cầu
- Node.js `>=18`
- npm hoặc yarn
- Python `>=3.10`
- pip
- Git

## Bước 1: Clone repo
```bash
git clone https://github.com/NguyxnVanwMinhGiang/Email-System-E2EE.git
cd Email-System-E2EE
```

## Bước 2: Cấu hình biến môi trường
```bash
cp .env.example .env
```
Sau đó chỉnh các giá trị cần thiết trong `.env`.

## Bước 3: Chạy Backend (Python)
```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python main.py
```

## Bước 4: Chạy Frontend (TypeScript)
Mở terminal mới:
```bash
cd frontend
npm install
npm run dev
```

## Bước 5: Truy cập hệ thống
- Frontend: `http://localhost:3000` (hoặc port theo cấu hình)
- Backend: `http://localhost:8000` (hoặc port theo cấu hình)

---

## 5. Biến môi trường (`.env.example`)

> Mẫu tham khảo:

```env
# APP
APP_NAME=Email-System-E2EE
APP_ENV=development
APP_PORT=8000

# FRONTEND
FRONTEND_URL=http://localhost:3000

# DATABASE
DATABASE_URL=postgresql://user:password@localhost:5432/email_system

# AUTH
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# E2EE
E2EE_PUBLIC_KEY_PATH=./keys/public.pem
E2EE_PRIVATE_KEY_PATH=./keys/private.pem
E2EE_ALGORITHM=RSA-OAEP

# SMTP (nếu có)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_user
SMTP_PASS=your_password
```

---

## Lưu ý bảo mật

- Không commit `.env`, private key hoặc credentials lên Git.
- Sử dụng secret manager cho production.
- Bật HTTPS và cấu hình CORS phù hợp khi deploy.

---

## License

MIT (hoặc cập nhật theo license thực tế của dự án).
