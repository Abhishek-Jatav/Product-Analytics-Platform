"""
Business logic for creating segments and previewing which users match.
"""
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.analytics import metrics as metrics_engine
from app.analytics.segment import evaluate_segment
from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.segment_repository import SegmentRepository
from app.schemas.segment import CreateSegmentRequest, SegmentPreview, SegmentResponse
from app.services.project_service import ProjectService

SAMPLE_SIZE = 20


class SegmentService:
    def __init__(self, db: Session):
        self.repo = SegmentRepository(db)
        self.analytics_repo = AnalyticsRepository(db)
        self.project_service = ProjectService(db)

    def create(self, project_id: uuid.UUID, user_id: uuid.UUID, payload: CreateSegmentRequest) -> SegmentResponse:
        self.project_service.get_owned_project(project_id, user_id)
        conditions = [c.model_dump() for c in payload.conditions]
        segment = self.repo.create(project_id, payload.name, conditions)
        return SegmentResponse.model_validate(segment)

    def list_for_project(self, project_id: uuid.UUID, user_id: uuid.UUID) -> list[SegmentResponse]:
        self.project_service.get_owned_project(project_id, user_id)
        segments = self.repo.list_for_project(project_id)
        return [SegmentResponse.model_validate(s) for s in segments]

    def preview(self, project_id: uuid.UUID, segment_id: uuid.UUID, user_id: uuid.UUID) -> SegmentPreview:
        self.project_service.get_owned_project(project_id, user_id)

        segment = self.repo.get_by_id(segment_id)
        if not segment or segment.project_id != project_id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Segment not found")

        events = self.analytics_repo.get_all_events(project_id)
        frame = metrics_engine._events_to_frame(list(events))
        matching_ids = evaluate_segment(frame, segment.conditions)

        return SegmentPreview(
            segment=SegmentResponse.model_validate(segment),
            matching_user_count=len(matching_ids),
            sample_distinct_ids=matching_ids[:SAMPLE_SIZE],
        )
