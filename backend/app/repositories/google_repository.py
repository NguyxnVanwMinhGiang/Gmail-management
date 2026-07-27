import datetime

from sqlalchemy import extract, func

from sqlalchemy.orm import Session
from app.models.users_gg import Users_gg

def create_user_gg(
    db: Session,
    google_id: str,
    full_name: str,
    email: str,
    google_refresh_token: str | None = None,
    role: str = "user",
    vip: bool = False,
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
        vip=vip,
        is_active=is_active,
        google_token_expires_at=google_token_expires_at,
        created_at=created_at
    )
    db.add(user_gg)
    db.commit()
    db.refresh(user_gg)
    return user_gg

def update_user_gg(
    db: Session,
    google_id: str,
    full_name,
    google_refresh_token,
    google_token_expires_at,
    vip: bool | None = None,
):
    user_gg = db.query(Users_gg).filter(Users_gg.google_id == google_id).first()
    if user_gg:
        user_gg.full_name = full_name
        if google_refresh_token:
            user_gg.google_refresh_token = google_refresh_token
        user_gg.google_token_expires_at = google_token_expires_at
        if vip is not None:
            user_gg.vip = vip
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

def find_by_google_account(db: Session, email: str):
    return db.query(Users_gg).filter(Users_gg.email == email).first()

def find_by_google_id(db: Session, google_id: str):
    return db.query(Users_gg).filter(Users_gg.google_id == str(google_id)).first()

def getRefreshTokenByGoogleId(db: Session, google_id: str):
    user_gg = db.query(Users_gg).filter(Users_gg.google_id == str(google_id)).first()
    if user_gg:
        return user_gg.google_refresh_token
    return None


def getRefreshTokenByUserId(db: Session, user_id: int):
    user_gg = db.query(Users_gg).filter(Users_gg.id == user_id).first()
    if user_gg:
        return user_gg.google_refresh_token
    return None

def find_by_google_account_webhook(db: Session, email_address: str, with_lock: bool = False):
    """
    Tìm kiếm tài khoản Google theo email, hỗ trợ Row-level locking (.with_for_update())
    """
    query = db.query(Users_gg).filter(Users_gg.email == email_address)
    
    if with_lock:
        query = query.with_for_update()
        
    return query.first()

def upadate_status_vip_google_account(db: Session, id: str, vip: bool):
    user_gg = db.query(Users_gg).filter(Users_gg.id == id).first()
    if user_gg:
        user_gg.vip = vip
        db.commit()
        db.refresh(user_gg)
    return user_gg

# ADMIN
def get_vip_users(db: Session, my_email: str):
    result = db.query(Users_gg.vip).filter(Users_gg.email == my_email).scalar()
    return result if result is not None else False

def get_google_account_by_user_id(db: Session, user_id: int):
    return db.query(Users_gg).filter(Users_gg.id == user_id).first()


def get_google_account(db: Session, user_id: int):
    return get_google_account_by_user_id(db, user_id)


def count_google_users(db: Session):
    return db.query(Users_gg).count()

def count_vip_google_users(db: Session):
    return db.query(Users_gg).filter(Users_gg.vip == True).count()


def count_visits_per_month(db: Session, year: int | None = None):
    current_year = year or datetime.datetime.now().year
    rows = (
        db.query(extract("month", Users_gg.created_at).label("month"), func.count(Users_gg.id))
        .filter(extract("year", Users_gg.created_at) == current_year)
        .group_by("month")
        .all()
    )
    return {int(month): int(total) for month, total in rows}


def count_vip_google_users_per_month(db: Session, year: int | None = None):
    current_year = year or datetime.datetime.now().year
    rows = (
        db.query(extract("month", Users_gg.created_at).label("month"), func.count(Users_gg.id))
        .filter(extract("year", Users_gg.created_at) == current_year)
        .filter(Users_gg.vip == True)
        .group_by("month")
        .all()
    )
    return {int(month): int(total) for month, total in rows}
