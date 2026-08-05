"""
Retention endpoints: Day 1/7/30 quick-look rates, and the full
day/week cohort retention matrix for the heatmap.
"""
import uuid
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.response import success_response
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.retention import RetentionMatrixFilters
from app.services.retention_service import RetentionService

router = APIRouter(prefix="/projects/{project_id}/retention", tags=["retention"])


@router.get("/summary")
def get_retention_summary(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    summary = RetentionService(db).summary(project_id, current_user.id)
    return success_response("Retention summary fetched", summary.model_dump())


@router.get("/matrix")
def get_retention_matrix(
    project_id: uuid.UUID,
    period: Literal["day", "week"] = Query(default="week"),
    num_periods: int = Query(default=8, ge=2, le=12),
    max_cohorts: int = Query(default=8, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filters = RetentionMatrixFilters(period=period, num_periods=num_periods, max_cohorts=max_cohorts)
    matrix = RetentionService(db).matrix(project_id, current_user.id, filters)
    return success_response("Retention matrix fetched", matrix.model_dump())
