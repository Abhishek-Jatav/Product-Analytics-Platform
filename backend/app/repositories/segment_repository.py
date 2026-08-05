"""
Direct DB access for the `segments` table.
"""
import uuid
from typing import Optional, Sequence

from sqlalchemy.orm import Session

from app.models.segment import Segment


class SegmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, project_id: uuid.UUID, name: str, conditions: list[dict]) -> Segment:
        segment = Segment(project_id=project_id, name=name, conditions=conditions)
        self.db.add(segment)
        self.db.commit()
        self.db.refresh(segment)
        return segment

    def list_for_project(self, project_id: uuid.UUID) -> Sequence[Segment]:
        return self.db.query(Segment).filter(Segment.project_id == project_id).order_by(Segment.created_at.desc()).all()

    def get_by_id(self, segment_id: uuid.UUID) -> Optional[Segment]:
        return self.db.query(Segment).filter(Segment.id == segment_id).first()
