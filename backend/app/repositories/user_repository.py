from sqlalchemy.orm import Session
from app.models.user import User

def find_email_4u(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def find_id_4u(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, email: str, password_hash: str, full_name: str | None = None):
    new_user = User(email=email, password_hash=password_hash, full_name=full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

