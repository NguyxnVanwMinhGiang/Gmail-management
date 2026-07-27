from typing import List
from fastapi import APIRouter, Depends, File, Header, Path, Query, Form, Request, UploadFile
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.middlewares.rate_limit_middleware import limiter
from app.services.friend_service import FriendService
from app.services.friendMail_service import friendMailService
from pydantic import BaseModel, EmailStr

router = APIRouter()

class AcceptFriendPayload(BaseModel):
    friendship_id: int
    
@router.post("/add")
@limiter.limit("10/second")
def send_friend_request(request: Request, token: str = Header(..., alias="Authorization"), friend_domain: EmailStr = Form(..., description="Email của người nhận lời mời kết bạn"),
                        db: Session = Depends(get_db)):
    # print(f"Received friend request to: {token}")
    return FriendService().send_friend_request(db=db, token=token, friend_domain=friend_domain)

@router.get("/list-friend-requests", response_model=List[dict])
@limiter.limit("10/second")
def get_friend_requests(request: Request, token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db)):
    return FriendService().get_friend_requests(db=db, token=token)

@router.put("/accept")
@limiter.limit("10/second")
def accept_friend_request(request: Request, payload: AcceptFriendPayload, token: str = Header(..., alias="Authorization"),
                          db: Session = Depends(get_db)):
    return FriendService().accept_friend_request(db=db, token=token, friendship_id=payload.friendship_id)

@router.delete("/reject")
@limiter.limit("10/second")
def reject_friend_request(request: Request, payload: AcceptFriendPayload, token: str = Header(..., alias="Authorization"),
                          db: Session = Depends(get_db)):
    return FriendService().reject_friend_request(db=db, token=token, friendship_id=payload.friendship_id)

@router.delete("/cancel")
@limiter.limit("10/second")
def cancel_friend_request(request: Request, payload: AcceptFriendPayload, token: str = Header(..., alias="Authorization"),
                          db: Session = Depends(get_db)):
    return FriendService().cancel_friend_request(db=db, token=token, friendship_id=payload.friendship_id)

@router.post("/block")
@limiter.limit("10/second")
def block_user(request: Request, token: str = Header(..., alias="Authorization"), target_mail: EmailStr = Form(..., description="Email của người dùng muốn chặn"),
               db: Session = Depends(get_db)):
    return FriendService().block_user(db=db, token=token, target_mail=target_mail)

@router.get("/list")
@limiter.limit("10/second")
def get_list_friends(request: Request, token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db)):
    return FriendService().get_list_friends(db=db, token=token)


@router.get("/inbox")
@limiter.limit("10/second")
def get_friend_inbox(
    request: Request,
    token: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
    friend_id: int = Query(..., ge=1),
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
):
    skip = (page - 1) * limit
    return friendMailService().get_friendemail_header(
        db=db,
        token=token,
        skip=skip,
        limit=limit,
        is_deleted=False,
        friend_id=friend_id,
    )


@router.get("/sent")
@limiter.limit("10/second")
def get_friend_sent(
    request: Request,
    token: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
    friend_id: int = Query(..., ge=1),
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
):
    skip = (page - 1) * limit
    return friendMailService().get_friendemail_sent_header(
        db=db,
        token=token,
        skip=skip,
        limit=limit,
        is_deleted=False,
        friend_id=friend_id,
    )


@router.get("/id/{message_id}")
@limiter.limit("10/second")

def get_friend_email_body(
    request: Request,
    token: str = Header(..., alias="Authorization"),
    message_id: str = Path(..., description="ID của email trong database"),
    db: Session = Depends(get_db),
    friend_id: int | None = Query(None, ge=1),
):
    return friendMailService().get_email_body_by_id(
        db=db,
        token=token,
        message_id=message_id,
        friend_id=friend_id,
    )