"""
Direct DB access for the `events` table: writing new events and
querying them for the Event Explorer (with pagination + name filter).
"""
import uuid
from typing import Optional, Sequence

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.event import Event


class EventRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, project_id: uuid.UUID, name: str, distinct_id: str, properties: dict) -> Event:
        event = Event(project_id=project_id, name=name, distinct_id=distinct_id, properties=properties)
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def list_for_project(
        self, project_id: uuid.UUID, event_name: Optional[str], page: int, page_size: int
    ) -> tuple[Sequence[Event], int]:
        query = self.db.query(Event).filter(Event.project_id == project_id)
        if event_name:
            query = query.filter(Event.name == event_name)

        total = query.with_entities(func.count(Event.id)).scalar() or 0
        items = (
            query.order_by(Event.timestamp.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return items, total

    def distinct_event_names(self, project_id: uuid.UUID) -> Sequence[str]:
        rows = (
            self.db.query(Event.name)
            .filter(Event.project_id == project_id)
            .distinct()
            .order_by(Event.name)
            .all()
        )
        return [r[0] for r in rows]
