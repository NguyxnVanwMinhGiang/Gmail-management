from pydantic import BaseModel, Field


class CreatePaymentRequest(BaseModel):
    order_id: str = Field(..., min_length=1)
    amount: int = Field(..., gt=0)
    order_info: str | None = None
