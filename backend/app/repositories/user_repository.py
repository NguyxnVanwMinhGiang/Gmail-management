from sqlalchemy.orm import Session
from app.models.user import User

def find_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, email: str, password_hash: str, full_name: str | None = None):
    new_user = User(email=email, password_hash=password_hash, full_name=full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

