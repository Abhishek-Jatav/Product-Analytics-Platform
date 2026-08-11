"""
Business logic for the dashboard: resolves date ranges, checks project
ownership, pulls raw events via the repository, and hands them to the
analytics engine (app/analytics/metrics.py) to compute KPIs.
"""
import uuid
from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy.orm import Session

from app.analytics import metrics
from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics import DashboardFilters, DashboardSummary, DashboardTrend, TrendPoint
from app.services.project_service import ProjectService

DEFAULT_RANGE_DAYS = 30


class AnalyticsService:
    def __init__(self, db: Session):
        self.repo = AnalyticsRepository(db)
        self.project_service = ProjectService(db)

    def _resolve_range(self, filters: DashboardFilters) -> tuple[date, date]:
        end = filters.end_date or date.today()
        start = filters.start_date or (end - timedelta(days=DEFAULT_RANGE_DAYS - 1))
        return start, end

    def summary(self, project_id: uuid.UUID, user_id: uuid.UUID, filters: DashboardFilters) -> DashboardSummary:
        self.project_service.get_owned_project(project_id, user_id)
        start, end = self._resolve_range(filters)
        start_dt = datetime.combine(start, time.min, tzinfo=timezone.utc)
        end_dt = datetime.combine(end, time.max, tzinfo=timezone.utc)

        events = self.repo.get_events_in_range(project_id, start_dt, end_dt)
        frame = metrics._events_to_frame(list(events))
        first_seen = self.repo.get_first_seen_map(project_id)

        active_users = metrics.active_user_count(frame, start_dt, end_dt)
        new_users = metrics.new_user_count(first_seen, start_dt, end_dt)

        dau = metrics.active_user_count(frame, datetime.combine(end, time.min, tzinfo=timezone.utc), end_dt)
        wau = metrics.active_user_count(
            frame, datetime.combine(end - timedelta(days=6), time.min, tzinfo=timezone.utc), end_dt
        )
        mau = metrics.active_user_count(
            frame, datetime.combine(end - timedelta(days=29), time.min, tzinfo=timezone.utc), end_dt
        )

        return DashboardSummary(
            start_date=start,
            end_date=end,
            dau=dau,
            wau=wau,
            mau=mau,
            active_users=active_users,
            new_users=new_users,
            returning_users=max(active_users - new_users, 0),
            revenue=metrics.revenue_sum(frame, filters.revenue_event, filters.revenue_property),
            conversion_rate=metrics.conversion_rate(frame, filters.conversion_event, active_users),
        )

    def trend(self, project_id: uuid.UUID, user_id: uuid.UUID, filters: DashboardFilters) -> DashboardTrend:
        self.project_service.get_owned_project(project_id, user_id)
        start, end = self._resolve_range(filters)
        start_dt, end_dt = datetime.combine(start, time.min), datetime.combine(end, time.max)

        events = self.repo.get_events_in_range(project_id, start_dt, end_dt)
        frame = metrics._events_to_frame(list(events))

        points = metrics.daily_active_users(frame, start, end)
        return DashboardTrend(points=[TrendPoint(date=d, active_users=c) for d, c in points])