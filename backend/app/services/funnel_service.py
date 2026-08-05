"""
Business logic for creating funnels and running the funnel analysis:
resolves the date range, pulls the relevant raw events, and hands them
to the funnel analytics engine.
"""
import uuid
from datetime import date, datetime, time, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.analytics import metrics as metrics_engine
from app.analytics.funnel import compute_funnel
from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.funnel_repository import FunnelRepository
from app.schemas.funnel import (
    CreateFunnelRequest,
    FunnelAnalysis,
    FunnelAnalysisFilters,
    FunnelResponse,
    FunnelStepResult,
)
from app.services.project_service import ProjectService

DEFAULT_RANGE_DAYS = 30


class FunnelService:
    def __init__(self, db: Session):
        self.repo = FunnelRepository(db)
        self.analytics_repo = AnalyticsRepository(db)
        self.project_service = ProjectService(db)

    def create(self, project_id: uuid.UUID, user_id: uuid.UUID, payload: CreateFunnelRequest) -> FunnelResponse:
        self.project_service.get_owned_project(project_id, user_id)
        funnel = self.repo.create(project_id, payload.name, payload.steps)
        return FunnelResponse.model_validate(funnel)

    def list_for_project(self, project_id: uuid.UUID, user_id: uuid.UUID) -> list[FunnelResponse]:
        self.project_service.get_owned_project(project_id, user_id)
        funnels = self.repo.list_for_project(project_id)
        return [FunnelResponse.model_validate(f) for f in funnels]

    def analyze(
        self, project_id: uuid.UUID, funnel_id: uuid.UUID, user_id: uuid.UUID, filters: FunnelAnalysisFilters
    ) -> FunnelAnalysis:
        self.project_service.get_owned_project(project_id, user_id)

        funnel = self.repo.get_by_id(funnel_id)
        if not funnel or funnel.project_id != project_id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Funnel not found")

        end = filters.end_date or date.today()
        start = filters.start_date or (end - timedelta(days=DEFAULT_RANGE_DAYS - 1))
        start_dt, end_dt = datetime.combine(start, time.min), datetime.combine(end, time.max)

        events = self.analytics_repo.get_events_in_range(project_id, start_dt, end_dt)
        frame = metrics_engine._events_to_frame(list(events))

        step_results = compute_funnel(frame, funnel.steps)

        return FunnelAnalysis(
            funnel=FunnelResponse.model_validate(funnel),
            start_date=start,
            end_date=end,
            steps=[FunnelStepResult(**s) for s in step_results],
        )
