"""
Direct DB access for the `alert_rules` table.
"""
import uuid
from typing import Optional, Sequence

from sqlalchemy.orm import Session

from app.models.alert import AlertRule


class AlertRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, project_id: uuid.UUID, name: str, metric: str, direction: str, threshold_percent: float) -> AlertRule:
        rule = AlertRule(
            project_id=project_id, name=name, metric=metric, direction=direction, threshold_percent=threshold_percent
        )
        self.db.add(rule)
        self.db.commit()
        self.db.refresh(rule)
        return rule

    def list_for_project(self, project_id: uuid.UUID) -> Sequence[AlertRule]:
        return self.db.query(AlertRule).filter(AlertRule.project_id == project_id).order_by(AlertRule.created_at.desc()).all()

    def get_by_id(self, rule_id: uuid.UUID) -> Optional[AlertRule]:
        return self.db.query(AlertRule).filter(AlertRule.id == rule_id).first()
