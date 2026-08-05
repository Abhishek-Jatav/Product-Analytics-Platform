"""
Dashboard endpoints: KPI summary and a daily-active-users trend for
charting, both filterable by date range.
"""
import uuid
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.response import success_response
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.analytics import DashboardFilters
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/projects/{project_id}/analytics", tags=["analytics"])


def _build_filters(
    start_date: Optional[date],
    end_date: Optional[date],
    conversion_event: str,
    revenue_event: str,
    revenue_property: str,
) -> DashboardFilters:
    return DashboardFilters(
        start_date=start_date,
        end_date=end_date,
        conversion_event=conversion_event,
        revenue_event=revenue_event,
        revenue_property=revenue_property,
    )


@router.get("/summary")
def get_summary(
    project_id: uuid.UUID,
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    conversion_event: str = Query(default="Purchase"),
    revenue_event: str = Query(default="Purchase"),
    revenue_property: str = Query(default="amount"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filters = _build_filters(start_date, end_date, conversion_event, revenue_event, revenue_property)
    summary = AnalyticsService(db).summary(project_id, current_user.id, filters)
    return success_response("Dashboard summary fetched", summary.model_dump())


@router.get("/trend")
def get_trend(
    project_id: uuid.UUID,
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filters = _build_filters(start_date, end_date, "Purchase", "Purchase", "amount")
    trend = AnalyticsService(db).trend(project_id, current_user.id, filters)
    return success_response("Trend fetched", trend.model_dump())
