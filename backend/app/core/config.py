from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SECRET_KEY_USER = os.getenv("SECRET_KEY_USER")
    SECRET_KEY_ADMIN = os.getenv("SECRET_KEY_ADMIN")
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

config = Config()