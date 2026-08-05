from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class DashboardFilters(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    conversion_event: str = "Purchase"
    revenue_event: str = "Purchase"
    revenue_property: str = "amount"


class DashboardSummary(BaseModel):
    start_date: date
    end_date: date
    dau: int
    wau: int
    mau: int
    active_users: int
    new_users: int
    returning_users: int
    revenue: float
    conversion_rate: float = Field(description="Percentage, 0-100")


class TrendPoint(BaseModel):
    date: date
    active_users: int


class DashboardTrend(BaseModel):
    points: list[TrendPoint]
