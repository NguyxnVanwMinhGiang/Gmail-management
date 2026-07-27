from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.payment_schema import CreatePaymentRequest
from app.services.payment_service import VNPayService
from app.utils.jwt_util import get_current_user

router = APIRouter()


@router.post("/create")
async def create_payment(
    payload: CreatePaymentRequest,
    request: Request,
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    token_payload = get_current_user(authorization)
    email = token_payload["email"]
    VNP_TMN_CODE = "Y6TTY1HS"  # Thay bằng mã thật nhận từ VNPay Developer
    VNP_HASH_SECRET = "VFW140T0MSOP45HJNZQHBX0S67ZHZ9AM"  # Thay bằng chuỗi mã hóa thật
    VNP_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
    VNP_RETURN_URL = "http://127.0.0.1:8000/api/v1/payment/return"
    VNP_IPN_URL = "https://rummage-protegee-smock.ngrok-free.dev/api/v1/payment/ipn"

    payment_url = VNPayService().create_payment_record_and_url(
        db=db,
        tmn_code=VNP_TMN_CODE,
        hash_secret=VNP_HASH_SECRET,
        payment_url=VNP_URL,
        return_url=VNP_RETURN_URL,
        txnp_ref=payload.order_id,
        amount=payload.amount,
        order_info=payload.order_info or "Thanh toan don hang trai nghiem",
        ip_address=request.client.host if request.client else "103.156.2.179",
        email=email,
    )
    return {"payment_url": payment_url}


@router.get("/return")
async def payment_return(request: Request, db: Session = Depends(get_db)):
    return VNPayService().vnpay_return(request, db)


@router.get("/ipn")
async def payment_ipn(request: Request, db: Session = Depends(get_db)):
    return VNPayService().vnpay_ipn(request, db)


@router.get("/status")
async def payment_status(authorization: str = Header(..., alias="Authorization"), db: Session = Depends(get_db)):
    token_payload = get_current_user(authorization)
    email = token_payload["email"]
    return VNPayService().get_payment_status(db, email)
