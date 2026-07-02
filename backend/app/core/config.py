from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SECRET_KEY_USER = os.getenv("SECRET_KEY_USER")
    SECRET_KEY_ADMIN = os.getenv("SECRET_KEY_ADMIN")
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
    RESEND_KEY = os.getenv("RESEND_KEY")

config = Config()