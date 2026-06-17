import datetime

from sqlalchemy.orm import Session
from app.models.users_gg import Users_gg

def create_user_gg(
    db: Session,
    google_id: str,
    full_name: str,
    email: str,
    google_refresh_token: str | None = None,
    role: str = "user",
    is_verified: bool = True,
    is_active: bool = True,
    google_token_expires_at: datetime.datetime | None = None,
    created_at: datetime.datetime | None = None,
):
    user_gg = Users_gg(
        google_id=google_id,
        full_name=full_name,
        email=email,
        google_refresh_token=google_refresh_token,
        role=role,
        is_verified=is_verified,    
        is_active=is_active,
        google_token_expires_at=google_token_expires_at,
        created_at=created_at
    )
    db.add(user_gg)
    db.commit()
    db.refresh(user_gg)
    return user_gg

def find_by_google_account(db: Session, email: str):
    return db.query(Users_gg).filter(Users_gg.email == email).first()

def find_by_id(db: Session, user_id: int):
    return db.query(Users_gg).filter(Users_gg.id == user_id).first()

def update_user_gg(db: Session, google_id: int, full_name, google_refresh_token, google_token_expires_at):
    user_gg = db.query(Users_gg).filter(Users_gg.google_id == google_id).first()
    if user_gg:
        user_gg.full_name = full_name
        user_gg.google_refresh_token = google_refresh_token
        user_gg.google_token_expires_at = google_token_expires_at
        db.commit()
        db.refresh(user_gg)
    return user_gg

def delete_user_gg(db: Session, user_gg_id: int):
    user_gg = db.query(Users_gg).filter(Users_gg.id == user_gg_id).first()
    if user_gg:
        db.delete(user_gg)
        db.commit()
        return True
    return False