import hashlib
import hmac
import urllib.parse
from datetime import datetime

def generate_vnpay_url(tmn_code, hash_secret, payment_url, return_url, txnp_ref, amount, order_info, ip_address):
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
    
    return final_url

if __name__ == "__main__":
    # Các thông tin giả định cấu hình Sandbox
    VNP_TMN_CODE = "Y6TTY1HS"  # Thay bằng mã thật nhận từ VNPay Developer
    VNP_HASH_SECRET = "VFW140T0MSOP45HJNZQHBX0S67ZHZ9AM"  # Thay bằng chuỗi mã hóa thật
    VNP_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
    VNP_RETURN_URL = "http://localhost:8000/payment-result"
    VNP_IPN_URL = "https://rummage-protegee-smock.ngrok-free.dev/payment/ipn"

    # Thông tin đơn hàng test
    order_id = "ORDER_2026_001"
    money = 50000  # 50,000 VND
    description = "Thanh toan don hang trai nghiem"
    client_ip = "127.0.0.1"

    payment_link = generate_vnpay_url(
        tmn_code=VNP_TMN_CODE,
        hash_secret=VNP_HASH_SECRET,
        payment_url=VNP_URL,
        return_url=VNP_RETURN_URL,
        txnp_ref=order_id,
        amount=money,
        order_info=description,
        ip_address=client_ip
    )
    
    print("--- URL Thanh toán được tạo ---")
    print(payment_link)
    
