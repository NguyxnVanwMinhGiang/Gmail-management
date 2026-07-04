from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.models.user import User
from app.models.users_gg import Users_gg
from app.models.friends import Friend
from app.models.friend_mail import FriendMails

# Truy van tat ca du lieu tu bang Friend 
def find_all_by_friendships_id(db: Session, friendship_id: int):
    return db.query(FriendMails).filter(FriendMails.id == friendship_id).all()

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
    """
    Bước 2: Người nhận (user_2) bấm chấp nhận lời mời.
    Hệ thống cập nhật Public Key của người nhận và đổi trạng thái sang 'accepted'.
    """
    # Tìm đúng lời mời đang ở trạng thái pending và người nhận phải trùng với receiver_id
    friendship = db.query(Friend).filter(
        Friend.id == friendship_id,
        Friend.user_id_2 == receiver_id, # Đảm bảo đúng người nhận mới có quyền đồng ý
        Friend.status == 'pending'
    ).first()


    # Đối phương đồng ý -> Cập nhật Public Key của họ và chuyển trạng thái
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
    
def get_received_requests(db: Session, user_id: int):
    """
    Lấy danh sách lời mời kết bạn MÀ USER NHẬN ĐƯỢC (đang chờ duyệt)
    Tương ứng với việc user_id nằm ở cột user_id_2
    """
    results = (
        db.query(Friend)
        .filter(
            Friend.user_id_2 == user_id,
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

def get_accepted_friends(db: Session, user_id: int):
    """
    Lấy danh sách bạn bè (ID, Domain, Ngày kết bạn) đã accepted.
    Sắp xếp: Ngày cũ lên đầu, ngày mới xuống dưới.
    """
    # Query và dùng order_by để sắp xếp từ cũ đến mới
    records = db.query(Friend).filter(
        Friend.status == 'accepted',
        or_(Friend.user_id_1 == user_id, Friend.user_id_2 == user_id)
    ).order_by(Friend.created_at.asc()).all() # .asc() giúp đẩy ngày cũ lên đầu
    
    friends_list = []
    for r in records:
        # Nếu mình là user_1 -> bạn mình là user_2 và ngược lại
        if r.user_id_1 == user_id:
            friend_id = r.user_id_2
            friend_domain = r.domain_user_2
        else:
            friend_id = r.user_id_1
            friend_domain = r.domain_user_1
            
        friends_list.append({
            "friend_id": friend_id,
            "domain": friend_domain,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else None
            # Dùng strftime để format lại ngày tháng cho đẹp nếu cần, hoặc giữ nguyên object datetime
        })
        
    return friends_list