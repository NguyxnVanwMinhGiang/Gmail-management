from decimal import Decimal
from datetime import datetime
import hashlib
import urllib.parse
import hmac
from fastapi import HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import config
from app.repositories.payment_repository import (
    create_payment_pending,
    get_payment_by_userid_email,
    get_payment_by_txn_ref,
    update_payment_status_ipn,
)
from app.models.payment import PaymentStatus
from app.repositories.user_repository import update_user_status_vip
from app.repositories.user_repository import find_email_4u
from app.repositories.google_repository import upadate_status_vip_google_account, find_by_google_account
from app.utils.vnpay import VNPay


class VNPayService:
    def set_vip_by_email(self, db: Session, email: str | None):
        if not email:
            return

        if email.endswith("@mail.foryou"):
            user = find_email_4u(db, email)
            if user:
                update_user_status_vip(db, user.id, vip=True)
        elif email.endswith("@gmail.com"):
            user_gg = find_by_google_account(db, email)
            if user_gg:
                upadate_status_vip_google_account(db, id=user_gg.id, vip=True)

    def create_payment_record_and_url(self, db: Session, tmn_code, hash_secret, payment_url, return_url, txnp_ref, amount, order_info, ip_address, email: str | None):
        vnp_params = {
            "vnp_Version": "2.1.0",
            "vnp_Command": "pay",
            "vnp_TmnCode": tmn_code,
            "vnp_Amount": str(int(amount) * 100),
            "vnp_CreateDate": datetime.now().strftime("%Y%m%d%H%M%S"),
            "vnp_CurrCode": "VND",
            "vnp_IpAddr": ip_address,
            "vnp_Locale": "vn",
            "vnp_OrderInfo": order_info,
            "vnp_OrderType": "other",
            "vnp_ReturnUrl": return_url,
            "vnp_TxnRef": str(txnp_ref),
        }

        sorted_params = sorted(vnp_params.items())

        hash_data = "&".join([f"{k}={urllib.parse.quote_plus(v)}" for k, v in sorted_params])

        secure_hash = hmac.new(
            hash_secret.encode('utf-8'),
            hash_data.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()

        # 5. Xây dựng URL thanh toán cuối cùng bằng cách nối secure_hash vào
        query_string = "&".join([f"{k}={urllib.parse.quote_plus(v)}" for k, v in sorted_params])
        final_url = f"{payment_url}?{query_string}&vnp_SecureHash={secure_hash}"
        create_payment_pending(
            db,
            order_id=str(txnp_ref),
            email=email,
            amount=amount,
            txn_ref=str(txnp_ref),
        )
        return final_url

    def vnpay_return(self, request: Request, db: Session):
        params = dict(request.query_params)
        vnp = VNPay()
        vnp.responseData = params.copy()
        VNP_HASH_SECRET = "VFW140T0MSOP45HJNZQHBX0S67ZHZ9AM"  # Thay bằng chuỗi mã hóa thật

        if not VNP_HASH_SECRET:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="VNPay configuration is missing")

        valid = vnp.validate_response(VNP_HASH_SECRET)
        response_code = params.get("vnp_ResponseCode")
        txn_ref = params.get("vnp_TxnRef")
        payment = get_payment_by_txn_ref(db, txn_ref) if txn_ref else None

        if payment and payment.status == PaymentStatus.PENDING:
            if valid and response_code == "00":
                payment.status = PaymentStatus.SUCCESS
                payment.transaction_no = params.get("vnp_TransactionNo")
                payment.payment_method = "VNPAY"
                db.commit()
                self.set_vip_by_email(db, payment.email)
            else:
                payment.status = PaymentStatus.FAILED
                payment.transaction_no = params.get("vnp_TransactionNo")
                payment.payment_method = "VNPAY"
                db.commit()
    
        
        frontend_return_url = "http://localhost:5173/mail?payment=success" if valid and response_code == "00" else "http://localhost:5173/mail?payment=failed"
        return RedirectResponse(url=frontend_return_url, status_code=302)

    def vnpay_ipn(self, request: Request, db: Session):
        params = dict(request.query_params)
        vnp = VNPay()
        vnp.responseData = params.copy()
        VNP_HASH_SECRET = "VFW140T0MSOP45HJNZQHBX0S67ZHZ9AM"  # Thay bằng chuỗi mã hóa thật
        if not VNP_HASH_SECRET:
            return {"RspCode": "97", "Message": "Missing signature config"}

        if not vnp.validate_response(VNP_HASH_SECRET):
            return {"RspCode": "97", "Message": "Invalid signature"}

        response_code = params.get("vnp_ResponseCode")
        return update_payment_status_ipn(db, params, response_code)

    def get_payment_status(self, db: Session, email: str):
        # Assuming you have a function to get the latest payment for a user
        payment = get_payment_by_userid_email(db, email)
        if not payment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
        payment_status = payment.status.value if hasattr(payment.status, "value") else payment.status
        return {"status": payment_status}
