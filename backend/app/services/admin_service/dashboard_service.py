from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import datetime

from app.repositories import user_repository, google_repository
from app.utils.jwt_util import get_current_admin

class DashboardService:
    @staticmethod
    def _ensure_admin(token: str):
        payload = get_current_admin(token)
        permissions = payload.get("permissions") or {}
        if permissions.get("management") is not True:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return payload

    def user(self, db: Session, token: str) -> dict:
        self._ensure_admin(token)

        total_users = user_repository.count_users(db)
        total_google_users = google_repository.count_google_users(db)

        total = total_users + total_google_users
        return {
            "total": total
        }
        
    def order(self, db: Session, token: str) -> int:
        self._ensure_admin(token)

        
        total_orders_user = user_repository.count_vip_users(db)
        total_orders_google = google_repository.count_vip_google_users(db)
        
        return {"total": total_orders_user + total_orders_google}
    
    def order_per_month(self, db: Session, token: str) -> dict:
        self._ensure_admin(token)

        orders_per_month_user = user_repository.count_vip_users_per_month(db)
        orders_per_month_google = google_repository.count_vip_google_users_per_month(db)

        return {
            "user": orders_per_month_user,
            "google": orders_per_month_google
        }
    
    def visit_per_month(self, db: Session, token: str) -> dict:
        self._ensure_admin(token)

        visits_per_month_user = user_repository.count_visits_per_month(db)
        visits_per_month_google = google_repository.count_visits_per_month(db)

        return {
            "user": visits_per_month_user,
            "google": visits_per_month_google
        }

    def summary(self, db: Session, token: str) -> dict:
        self._ensure_admin(token)

        total_users = user_repository.count_users(db) + google_repository.count_google_users(db)
        total_orders = user_repository.count_vip_users(db) + google_repository.count_vip_google_users(db)

        current_month = datetime.datetime.now().month
        previous_month = 12 if current_month == 1 else current_month - 1
        current_year = datetime.datetime.now().year
        previous_year = current_year - 1 if current_month == 1 else current_year

        current_orders = (
            user_repository.count_vip_users_per_month(db).get(current_month, 0)
            + google_repository.count_vip_google_users_per_month(db).get(current_month, 0)
        )
        previous_orders = (
            user_repository.count_vip_users_per_month(db, previous_year).get(previous_month, 0)
            + google_repository.count_vip_google_users_per_month(db, previous_year).get(previous_month, 0)
        )
        growth_rate = ((current_orders - previous_orders) / previous_orders * 100) if previous_orders else (100.0 if current_orders else 0.0)

        monthly_visits_user = user_repository.count_visits_per_month(db)
        monthly_visits_google = google_repository.count_visits_per_month(db)
        monthly_orders_user = user_repository.count_vip_users_per_month(db)
        monthly_orders_google = google_repository.count_vip_google_users_per_month(db)

        months = list(range(1, 13))
        labels = [f"T{month}" for month in months]
        visits_series = [
            monthly_visits_user.get(month, 0) + monthly_visits_google.get(month, 0)
            for month in months
        ]
        orders_series = [
            monthly_orders_user.get(month, 0) + monthly_orders_google.get(month, 0)
            for month in months
        ]

        return {
            "summary": {
                "total_users": total_users,
                "total_orders": total_orders,
                "growth_rate": round(growth_rate, 2),
                "current_month_orders": current_orders,
                "previous_month_orders": previous_orders,
            },
            "monthly": {
                "labels": labels,
                "visits": visits_series,
                "orders": orders_series,
            },
        }
    
    
