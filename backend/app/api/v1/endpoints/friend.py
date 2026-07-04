from typing import List
from fastapi import APIRouter, Depends, File, Header, Path, Query, Form, UploadFile
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.friend_service import FriendService
from pydantic import BaseModel, EmailStr

router = APIRouter()

class AcceptFriendPayload(BaseModel):
    friendship_id: int
    
@router.post("/add")
def send_friend_request(token: str = Header(..., alias="Authorization"), friend_domain: EmailStr = Form(..., description="Email của người nhận lời mời kết bạn"),
                        db: Session = Depends(get_db)):
    # print(f"Received friend request to: {token}")
    return FriendService().send_friend_request(db=db, token=token, friend_domain=friend_domain)

@router.get("/list-friend-requests", response_model=List[dict])
def get_friend_requests(token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db)):
    return FriendService().get_friend_requests(db=db, token=token)

@router.put("/accept")
def accept_friend_request(payload: AcceptFriendPayload, token: str = Header(..., alias="Authorization"),
                          db: Session = Depends(get_db)):
    return FriendService().accept_friend_request(db=db, token=token, friendship_id=payload.friendship_id)

@router.delete("/reject")
def reject_friend_request(payload: AcceptFriendPayload, token: str = Header(..., alias="Authorization"),
                          db: Session = Depends(get_db)):
    return FriendService().reject_friend_request(db=db, token=token, friendship_id=payload.friendship_id)

@router.delete("/cancel")
def cancel_friend_request(payload: AcceptFriendPayload, token: str = Header(..., alias="Authorization"),
                          db: Session = Depends(get_db)):
    return FriendService().cancel_friend_request(db=db, token=token, friendship_id=payload.friendship_id)

@router.post("/block")
def block_user(token: str = Header(..., alias="Authorization"), target_mail: EmailStr = Form(..., description="Email của người dùng muốn chặn"),
               db: Session = Depends(get_db)):
    return FriendService().block_user(db=db, token=token, target_mail=target_mail)

@router.get("/list")
def get_list_friends(token: str = Header(..., alias="Authorization"), db: Session = Depends(get_db)):
    return FriendService().get_list_friends(db=db, token=token)