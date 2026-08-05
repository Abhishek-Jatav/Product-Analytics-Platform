"""
Business logic for creating alert rules and checking whether they're
currently triggered.
"""
import uuid
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.analytics import metrics as metrics_engine
from app.analytics.alerts import evaluate_alert
from app.repositories.alert_repository import AlertRepository
from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.alert import AlertCheckResult, AlertRuleResponse, CreateAlertRuleRequest
from app.services.project_service import ProjectService


class AlertService:
    def __init__(self, db: Session):
        self.repo = AlertRepository(db)
        self.analytics_repo = AnalyticsRepository(db)
        self.project_service = ProjectService(db)

    def create(self, project_id: uuid.UUID, user_id: uuid.UUID, payload: CreateAlertRuleRequest) -> AlertRuleResponse:
        self.project_service.get_owned_project(project_id, user_id)
        rule = self.repo.create(project_id, payload.name, payload.metric, payload.direction, payload.threshold_percent)
        return AlertRuleResponse.model_validate(rule)

    def list_for_project(self, project_id: uuid.UUID, user_id: uuid.UUID) -> list[AlertRuleResponse]:
        self.project_service.get_owned_project(project_id, user_id)
        rules = self.repo.list_for_project(project_id)
        return [AlertRuleResponse.model_validate(r) for r in rules]

    def check(self, project_id: uuid.UUID, rule_id: uuid.UUID, user_id: uuid.UUID) -> AlertCheckResult:
        self.project_service.get_owned_project(project_id, user_id)

        rule = self.repo.get_by_id(rule_id)
        if not rule or rule.project_id != project_id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Alert rule not found")

        events = self.analytics_repo.get_all_events(project_id)
        frame = metrics_engine._events_to_frame(list(events))

        result = evaluate_alert(frame, rule.metric.value, rule.direction.value, rule.threshold_percent, date.today())

        return AlertCheckResult(rule=AlertRuleResponse.model_validate(rule), **result)
