from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.models.user import User
from app.models.users_gg import Users_gg
from app.models.friends import Friend
from app.models.friend_mail import FriendMails

def send_friend_request(db: Session, sender_id: int, sender_domain: str, sender_key: str, receiver_id: int, receiver_domain: str):
    # Kiểm tra xem giữa 2 user đã có tương tác nào chưa (bất kể ai gửi trước)
    db.query(Friend).filter(
        or_(
            and_(Friend.user_id_1 == sender_id, Friend.user_id_2 == receiver_id),
            and_(Friend.user_id_1 == receiver_id, Friend.user_id_2 == sender_id)
        )
    ).first()

    # Tạo bản ghi mới ở trạng thái pending
    new_request = Friend(
        user_id_1=sender_id,
        user_id_2=receiver_id,
        domain_user_1=sender_domain,
        domain_user_2=receiver_domain,
        public_key_user_1=sender_key,
        public_key_user_2=None,  # Để trống vì đối phương chưa đồng ý chia sẻ
        status='pending'
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

def accept_friend_request(db: Session, receiver_id: int, receiver_key: str, friendship_id: int):
    friendship = db.query(Friend).filter(
        Friend.id == friendship_id,
        Friend.user_id_2 == receiver_id,
        Friend.status == 'pending'
    ).first()

    friendship.public_key_user_2 = receiver_key
    friendship.status = 'accepted'
    
    db.commit()
    db.refresh(friendship)
    return {"success": True, "message": "Đã kết bạn thành công. Public Key đã được chia sẻ.", "data": friendship}


def cancel_friend_request(db: Session, sender_id: int, friendship_id: int):
    """
    Người gửi (user_id_1) chủ động rút lại lời mời kết bạn đang ở trạng thái 'pending'.
    """
    # Tìm bản ghi phải thỏa mãn: đúng ID, đúng người gửi, và trạng thái phải là pending
    friendship = db.query(Friend).filter(
        Friend.id == friendship_id,
        Friend.user_id_1 == sender_id,
        Friend.status == 'pending'
    ).first()

    # Xóa bản ghi để người dùng có thể gửi lại lời mời sau này nếu muốn
    db.delete(friendship)
    db.commit()
    
    return friendship


def reject_friend_request(db: Session, receiver_id: int, friendship_id: int):
    """
    Người nhận (user_id_2) bấm từ chối lời mời kết bạn đang ở trạng thái 'pending'.
    """
    # Tìm bản ghi phải thỏa mãn: đúng ID, đúng người nhận, và trạng thái phải là pending
    friendship = db.query(Friend).filter(
        Friend.id == friendship_id,
        Friend.user_id_2 == receiver_id,
        Friend.status == 'pending'
    ).first()

    # Tiến hành xóa bản ghi lời mời
    db.delete(friendship)
    db.commit()
    
    return friendship

def block_user(db: Session, current_user_id: int, target_user_id: int):
    # 1. Tìm bản ghi đang tồn tại giữa 2 user (không phân biệt ai là 1, ai là 2)
    friendship = db.query(Friend).filter(
        or_(
            and_(Friend.user_id_1 == current_user_id, Friend.user_id_2 == target_user_id),
            and_(Friend.user_id_1 == target_user_id, Friend.user_id_2 == current_user_id)
        )
    ).first()

    # Nếu đã có mối quan hệ (bạn bè hoặc đang chờ), cập nhật thành blocked
    friendship.status = 'blocked'
    db.commit()
    db.refresh(friendship)

    return friendship
    
def get_received_requests(db: Session, user_id: int, user_domain: str):
    """
    Lấy danh sách lời mời kết bạn MÀ USER NHẬN ĐƯỢC (đang chờ duyệt)
    Tương ứng với việc user_id nằm ở cột user_id_2
    """
    results = (
        db.query(Friend)
        .filter(
            Friend.user_id_2 == user_id,
            Friend.domain_user_2 == user_domain,
            Friend.status == "pending"
        )
        .all()
    )

    output = []

    for friend in results:
        output.append({
            "friendship_id": friend.id,
            "status": friend.status,
            "created_at": friend.created_at,
            "sender_domain": friend.domain_user_1,
        })

    return output

def get_sent_requests(db: Session, user_id: int):
    """
    Lấy danh sách lời mời kết bạn MÀ USER ĐÃ GỬI ĐI (đang chờ đối phương duyệt)
    Tương ứng với việc user_id nằm ở cột user_id_1
    """
    results = (
        db.query(Friend)
        .filter(
            Friend.user_id_1 == user_id,
            Friend.status == "pending"
        )
        .all()
    )

    output = []

    for friend in results:
        output.append({
            "friendship_id": friend.id,
            "status": friend.status,
            "created_at": friend.created_at,
            "sender_domain": friend.domain_user_2,
        })

    return output

def check_friendship(db: Session, userId: int, receiver_id: int):
    friendship = db.query(Friend).filter(
        or_(
            and_(Friend.user_id_1 == userId, Friend.user_id_2 == receiver_id),
            and_(Friend.user_id_1 == receiver_id, Friend.user_id_2 == userId)
        )
    ).first()
    return friendship

def get_accepted_friends(db: Session, user_id: int, user_domain: str):
    """
    Lấy danh sách bạn bè đã accepted.
    Dùng tổ hợp ID + Domain để chống trùng lặp chéo giữa các bảng User.
    """
    # 1. Query kiểm tra khắt khe cả ID và Domain
    records = db.query(Friend).filter(
        Friend.status == 'accepted',
        or_(
            and_(Friend.user_id_1 == user_id, Friend.domain_user_1 == user_domain),
            and_(Friend.user_id_2 == user_id, Friend.domain_user_2 == user_domain)
        )
    ).order_by(Friend.created_at.asc()).all()
    
    friends_list = []
    seen_friend_keys: set[str] = set() # Đổi sang lưu string thay vì int
    
    for r in records:
        # 2. Xác định rõ ràng mình là ai trong mối quan hệ này
        is_user_1 = (r.user_id_1 == user_id and r.domain_user_1 == user_domain)
        
        friend_id = r.user_id_2 if is_user_1 else r.user_id_1
        friend_domain = r.domain_user_2 if is_user_1 else r.domain_user_1
        
        # 3. Chống trùng lặp bằng key ghép giữa ID và Domain
        unique_key = f"{friend_id}_{friend_domain}"
        if unique_key in seen_friend_keys:
            continue
            
        seen_friend_keys.add(unique_key)
        
        friends_list.append({
            "friend_id": friend_id,
            "domain": friend_domain,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else None
        })
        
    return friends_list

def check_is_friend(db: Session, my_user_id: int, user_id_friend: int, email_from: str, friend_domain: str):
    existing_friendship = db.query(Friend).filter(
        # Chiều 1: Mình là người gửi (1), Họ là người nhận (2)
        ((Friend.user_id_1 == my_user_id) & (Friend.domain_user_1 == email_from) & 
            (Friend.user_id_2 == user_id_friend) & (Friend.domain_user_2 == friend_domain)) |
        
        # Chiều 2: Họ là người gửi (1), Mình là người nhận (2)
        ((Friend.user_id_1 == user_id_friend) & (Friend.domain_user_1 == friend_domain) & 
            (Friend.user_id_2 == my_user_id) & (Friend.domain_user_2 == email_from))
    ).first()

    return existing_friendship