"""
Business logic for ingesting events (from the SDK, via API key) and
querying them for the Event Explorer (from the dashboard, via JWT).
"""
import uuid

from sqlalchemy.orm import Session

from app.repositories.event_repository import EventRepository
from app.schemas.event import EventFilters, EventListResponse, EventResponse, TrackEventRequest
from app.services.project_service import ProjectService


class EventService:
    def __init__(self, db: Session):
        self.repo = EventRepository(db)
        self.project_service = ProjectService(db)

    def track(self, project_id: uuid.UUID, payload: TrackEventRequest) -> EventResponse:
        event = self.repo.create(
            project_id=project_id,
            name=payload.name,
            distinct_id=payload.distinct_id,
            properties=payload.properties,
        )
        return EventResponse.model_validate(event)

    def explore(self, project_id: uuid.UUID, user_id: uuid.UUID, filters: EventFilters) -> EventListResponse:
        self.project_service.get_owned_project(project_id, user_id)  # authorization check
        items, total = self.repo.list_for_project(project_id, filters.event_name, filters.page, filters.page_size)
        return EventListResponse(
            items=[EventResponse.model_validate(e) for e in items],
            total=total,
            page=filters.page,
            page_size=filters.page_size,
        )

    def list_event_names(self, project_id: uuid.UUID, user_id: uuid.UUID) -> list[str]:
        self.project_service.get_owned_project(project_id, user_id)
        return list(self.repo.distinct_event_names(project_id))
