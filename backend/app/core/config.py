from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SECRET_KEY_USER = os.getenv("SECRET_KEY_USER")
    SECRET_KEY_ADMIN = os.getenv("SECRET_KEY_ADMIN")
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

    SMTP_SERVER = os.getenv("SMTP_SERVER")
    SMTP_PORT = int(os.getenv("SMTP_PORT"))
    SENDER_EMAIL = os.getenv("SENDER_EMAIL")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    
    VNPAY_TMN_CODE= os.getenv("VNPAY_TMN_CODE")
    VNPAY_HASH_SECRET= os.getenv("VNPAY_HASH_SECRET")
    VNPAY_PAYMENT_URL= os.getenv("VNPAY_PAYMENT_URL")
    VNPAY_RETURN_URL= os.getenv("VNPAY_RETURN_URL")
    VNPAY_IPN_URL= os.getenv("VNPAY_IPN_URL")

config = Config()