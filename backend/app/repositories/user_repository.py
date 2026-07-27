import datetime

from sqlalchemy import extract, func
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

def get_all_users(db: Session):
    return db.query(User).order_by(User.id.asc()).all()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def update_user_status_vip(
    db: Session,
    user_id: int,
    *,
    is_active: bool | None = None,
    vip: bool | None = None,
):
    user = get_user_by_id(db, user_id)
    if user is None:
        return None

    if is_active is not None:
        user.is_active = is_active

    if vip is not None:
        user.vip = vip

    db.commit()
    db.refresh(user)
    return user

def get_vip_users(db: Session, my_email: str):
    result = db.query(User.vip).filter(User.email == my_email).scalar()
    return result if result is not None else False

def count_users(db: Session):
    return db.query(User).count()

def count_vip_users(db: Session):
    return db.query(User).filter(User.vip == True).count()


def count_visits_per_month(db: Session, year: int | None = None):
    current_year = year or datetime.datetime.now().year
    rows = (
        db.query(extract("month", User.created_at).label("month"), func.count(User.id))
        .filter(extract("year", User.created_at) == current_year)
        .group_by("month")
        .all()
    )
    return {int(month): int(total) for month, total in rows}


def count_vip_users_per_month(db: Session, year: int | None = None):
    current_year = year or datetime.datetime.now().year
    rows = (
        db.query(extract("month", User.created_at).label("month"), func.count(User.id))
        .filter(extract("year", User.created_at) == current_year)
        .filter(User.vip == True)
        .group_by("month")
        .all()
    )
    return {int(month): int(total) for month, total in rows}
