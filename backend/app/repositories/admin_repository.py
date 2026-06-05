import json

from sqlalchemy.orm import Session
from app.models.admin import Admin

def find_by_email(db: Session, email: str):
    return db.query(Admin).filter(Admin.email == email).first()

def get_all_admin(db: Session): 
    return db.query(Admin).all()

def get_admin_by_id(db: Session, admin_id: int):
    return db.query(Admin).filter(Admin.id == admin_id).first()

def create_admin(
    db: Session,
    email: str,
    password_hash: str,
    full_name: str,
    permissions: dict,
    created_by: int | None = None,
    ):
    admin = Admin(
        email=email,
        password_hash=password_hash,
        full_name=full_name,
        permissions=permissions,
        role="admin",
        created_by=created_by,
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return admin

def update_admin(
    db: Session,
    admin_id: int,
    full_name: str,
    email: str,
    permissions: dict | None = None,
    is_active: bool | None = None,
    is_verified: bool | None = None,
    updated_by: int | None = None
    ):

    admin = get_admin_by_id(db, admin_id)

    if not admin:
        return None
    
    if full_name is not None:
        admin.full_name = full_name

    if email is not None:
        admin.email = email

    if permissions is not None:
        admin.permissions = permissions

    if is_active is not None:
        admin.is_active = is_active

    if is_verified is not None:
        admin.is_verified = is_verified

    if updated_by is not None:
        admin.updated_by = updated_by

    db.commit()
    db.refresh(admin)
    return admin

def change_password(db: Session, admin_id: int, password_hash: str):
    admin = get_admin_by_id(db, admin_id)

    if not admin:
        return None
    
    admin.password_hash = password_hash
    db.commit()
    db.refresh(admin)
    return admin

def delete_admin(db: Session, admin_id: int):
    admin = get_admin_by_id(db, admin_id)

    if not admin:
        return None
    
    db.delete(admin)
    db.commit()

    return admin

# def create_admin(db: Session, email: str, password_hash: str, full_name: str, permissions: json):
#     new_admin = Admin(email=email, password_hash=password_hash, full_name=full_name, permissions=permissions)
#     db.add(new_admin)
#     db.commit()
#     db.refresh(new_admin)

#     return new_admin