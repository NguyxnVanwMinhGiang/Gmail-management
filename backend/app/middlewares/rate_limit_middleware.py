# app/core/ratelimit.py
from slowapi import Limiter
from slowapi.util import get_remote_address

# Khởi tạo thực thể limiter tại đây để bẻ gãy vòng lặp import
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])