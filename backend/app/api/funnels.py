"""
Funnel endpoints: create/list funnels for a project, and run the
step-by-step conversion analysis for one funnel over a date range.
"""
import uuid
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.response import success_response
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.funnel import CreateFunnelRequest, FunnelAnalysisFilters
from app.services.funnel_service import FunnelService

router = APIRouter(prefix="/projects/{project_id}/funnels", tags=["funnels"])


@router.post("")
def create_funnel(
    project_id: uuid.UUID,
    payload: CreateFunnelRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    funnel = FunnelService(db).create(project_id, current_user.id, payload)
    return success_response("Funnel created successfully", funnel.model_dump())


@router.get("")
def list_funnels(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    funnels = FunnelService(db).list_for_project(project_id, current_user.id)
    return success_response("Funnels fetched", [f.model_dump() for f in funnels])


@router.get("/{funnel_id}/analysis")
def analyze_funnel(
    project_id: uuid.UUID,
    funnel_id: uuid.UUID,
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filters = FunnelAnalysisFilters(start_date=start_date, end_date=end_date)
    analysis = FunnelService(db).analyze(project_id, funnel_id, current_user.id, filters)
    return success_response("Funnel analysis complete", analysis.model_dump())
