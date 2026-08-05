"""
Alert endpoints: create/list alert rules, and check one on demand.
"""
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.response import success_response
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.alert import CreateAlertRuleRequest
from app.services.alert_service import AlertService

router = APIRouter(prefix="/projects/{project_id}/alerts", tags=["alerts"])


@router.post("")
def create_alert_rule(
    project_id: uuid.UUID,
    payload: CreateAlertRuleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rule = AlertService(db).create(project_id, current_user.id, payload)
    return success_response("Alert rule created successfully", rule.model_dump())


@router.get("")
def list_alert_rules(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rules = AlertService(db).list_for_project(project_id, current_user.id)
    return success_response("Alert rules fetched", [r.model_dump() for r in rules])


@router.get("/{rule_id}/check")
def check_alert_rule(
    project_id: uuid.UUID,
    rule_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = AlertService(db).check(project_id, rule_id, current_user.id)
    return success_response("Alert check complete", result.model_dump())
