from sqlalchemy.orm import Session
from app.models.users_gg import Users_gg

def create_user_gg(
    db: Session,
    google_id: str,
    full_name: str,
    email: str,
    role: str = "user",
    is_verified: bool = True,
    is_active: bool = True,
    created_at: int | None = None,
):
    user_gg = Users_gg(
        google_id=google_id,
        full_name=full_name,
        email=email,
        role=role,
        is_verified=is_verified,
        is_active=is_active,
        created_at=created_at
    )
    db.add(user_gg)
    db.commit()
    db.refresh(user_gg)
    return user_gg

def find_by_google_id(db: Session, google_id: str):
    return db.query(Users_gg).filter(Users_gg.google_id == google_id).first()

def delete_user_gg(db: Session, user_gg_id: int):
    user_gg = db.query(Users_gg).filter(Users_gg.id == user_gg_id).first()
    if user_gg:
        db.delete(user_gg)
        db.commit()
        return True
    return False