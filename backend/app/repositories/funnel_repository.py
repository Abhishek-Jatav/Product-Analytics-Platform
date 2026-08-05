"""
Direct DB access for the `funnels` table.
"""
import uuid
from typing import Optional, Sequence

from sqlalchemy.orm import Session

from app.models.funnel import Funnel


class FunnelRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, project_id: uuid.UUID, name: str, steps: list[str]) -> Funnel:
        funnel = Funnel(project_id=project_id, name=name, steps=steps)
        self.db.add(funnel)
        self.db.commit()
        self.db.refresh(funnel)
        return funnel

    def list_for_project(self, project_id: uuid.UUID) -> Sequence[Funnel]:
        return self.db.query(Funnel).filter(Funnel.project_id == project_id).order_by(Funnel.created_at.desc()).all()

    def get_by_id(self, funnel_id: uuid.UUID) -> Optional[Funnel]:
        return self.db.query(Funnel).filter(Funnel.id == funnel_id).first()
