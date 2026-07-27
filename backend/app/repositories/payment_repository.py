from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.payment import Payment, PaymentStatus


def update_payment_status_ipn(db: Session, vnp_params: dict , response_code: str) -> dict:
    """
    Truy vấn và xử lý cập nhật trạng thái thanh toán từ dữ liệu VNPay gửi về.
    Hàm này tuân thủ các quy tắc phản hồi (RspCode) của VNPay dành cho IPN.
    """
    # Lấy các tham số cần thiết từ VNPay
    txn_ref = vnp_params.get("vnp_TxnRef")
    vnp_amount_raw = vnp_params.get("vnp_Amount")
    vnp_response_code = vnp_params.get("vnp_ResponseCode")
    vnp_transaction_no = vnp_params.get("vnp_TransactionNo")

    # 1. Tìm bản ghi thanh toán trong DB dựa trên txn_ref (vnp_TxnRef)
    stmt = select(Payment).where(Payment.txn_ref == txn_ref)
    payment = db.execute(stmt).scalar_one_or_none()

    # KIỂM TRA 1: Đơn hàng có tồn tại trong hệ thống của bạn không?
    if not payment:
        return {"RspCode": "01", "Message": "Order not found"}

    # KIỂM TRA 2: Số tiền thanh toán có khớp với hóa đơn không?
    # Vì VNPay gửi số tiền nhân 100 (Ví dụ 50,000 VND -> 5000000), ta phải chia cho 100 trước khi so sánh với Numeric(15,2)
    try:
        vnp_amount = Decimal(vnp_amount_raw) / 100
    except (TypeError, ValueError):
        return {"RspCode": "99", "Message": "Input data format invalid"}

    if payment.amount != vnp_amount:
        return {"RspCode": "04", "Message": "Invalid amount"}

    # KIỂM TRA 3: Đơn hàng đã được xử lý trước đó chưa? (Tránh ghi đè dữ liệu nếu VNPay gọi lại IPN)
    if payment.status != PaymentStatus.PENDING:
        return {"RspCode": "02", "Message": "Order already confirmed"}

    if vnp_response_code == "00":
        payment.status = PaymentStatus.SUCCESS
    else:
        payment.status = PaymentStatus.FAILED

    # Cập nhật thêm các thông tin đối chiếu từ VNPay
    payment.transaction_no = vnp_transaction_no
    payment.payment_method = "VNPAY"  # Hoặc lấy chi tiết từ vnp_CardType / vnp_BankCode nếu muốn

    # 3. Lưu lại vào Database
    try:
        db.commit()
        return {"RspCode": "00", "Message": "Confirm Success"}
    except Exception as e:
        db.rollback()
        # Log lỗi hệ thống ở đây (ví dụ: logger.error(e))
        return {"RspCode": "99", "Message": "Database update error"}


def create_payment_pending(
    db: Session,
    *,
    order_id: str,
    email: str | None,
    amount: Decimal,
    txn_ref: str,
) -> Payment:
    payment = Payment(
        order_id=order_id,
        email=email,
        amount=amount,
        txn_ref=txn_ref,
        status=PaymentStatus.PENDING,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def get_payment_by_userid_email(db: Session, email: str):
    stmt = select(Payment).where(Payment.email == email)
    return db.execute(stmt).scalar_one_or_none()


def get_payment_by_txn_ref(db: Session, txn_ref: str):
    stmt = select(Payment).where(Payment.txn_ref == txn_ref)
    return db.execute(stmt).scalar_one_or_none()
