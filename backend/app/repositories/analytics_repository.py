"""
Direct DB access for computing analytics. Pulls raw rows for a project
and hands them to the analytics engine (app/analytics/) for aggregation,
rather than trying to express every metric as SQL — keeps the metric
definitions in one testable place instead of scattered across queries.
"""
import uuid
from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.event import Event


class AnalyticsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_events_in_range(
        self, project_id: uuid.UUID, start: datetime, end: datetime, event_name: Optional[str] = None
    ) -> Sequence[Event]:
        query = self.db.query(Event).filter(
            Event.project_id == project_id, Event.timestamp >= start, Event.timestamp <= end
        )
        if event_name:
            query = query.filter(Event.name == event_name)
        return query.all()

    def get_all_events(self, project_id: uuid.UUID) -> Sequence[Event]:
        """
        Retention needs a user's full activity history (to know if they came
        back weeks after their first event), not a bounded range. Fine at
        this scale; a production system would pre-aggregate this instead of
        scanning raw events on every request.
        """
        return self.db.query(Event).filter(Event.project_id == project_id).all()

    def get_events_by_name(self, project_id: uuid.UUID, event_name: str) -> Sequence[Event]:
        return self.db.query(Event).filter(Event.project_id == project_id, Event.name == event_name).all()

    def get_first_seen_map(self, project_id: uuid.UUID) -> dict[str, datetime]:
        """Earliest event timestamp per distinct_id, across all time (not just the filtered range)."""
        rows = (
            self.db.query(Event.distinct_id, func.min(Event.timestamp))
            .filter(Event.project_id == project_id)
            .group_by(Event.distinct_id)
            .all()
        )
        return {distinct_id: first_seen for distinct_id, first_seen in rows}
