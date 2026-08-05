"""
Business logic for retention: pulls a project's full event history and
first-seen map, and hands them to the retention analytics engine.
"""
import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.analytics import metrics as metrics_engine
from app.analytics.retention import compute_day_n_retention, compute_retention_matrix
from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.retention import (
    RetentionCohortRow,
    RetentionMatrix,
    RetentionMatrixFilters,
    RetentionRatePoint,
    RetentionSummary,
)
from app.services.project_service import ProjectService


class RetentionService:
    def __init__(self, db: Session):
        self.repo = AnalyticsRepository(db)
        self.project_service = ProjectService(db)

    def _load(self, project_id: uuid.UUID, user_id: uuid.UUID):
        self.project_service.get_owned_project(project_id, user_id)
        events = self.repo.get_all_events(project_id)
        frame = metrics_engine._events_to_frame(list(events))
        first_seen = self.repo.get_first_seen_map(project_id)
        return frame, first_seen

    def summary(self, project_id: uuid.UUID, user_id: uuid.UUID) -> RetentionSummary:
        frame, first_seen = self._load(project_id, user_id)
        as_of = date.today()

        return RetentionSummary(
            as_of=as_of,
            day1=RetentionRatePoint(**compute_day_n_retention(frame, first_seen, 1, as_of)),
            day7=RetentionRatePoint(**compute_day_n_retention(frame, first_seen, 7, as_of)),
            day30=RetentionRatePoint(**compute_day_n_retention(frame, first_seen, 30, as_of)),
        )

    def matrix(self, project_id: uuid.UUID, user_id: uuid.UUID, filters: RetentionMatrixFilters) -> RetentionMatrix:
        frame, first_seen = self._load(project_id, user_id)
        as_of = date.today()

        rows = compute_retention_matrix(
            frame, first_seen, filters.period, filters.num_periods, filters.max_cohorts, as_of
        )
        return RetentionMatrix(
            period=filters.period,
            num_periods=filters.num_periods,
            cohorts=[RetentionCohortRow(**r) for r in rows],
        )
