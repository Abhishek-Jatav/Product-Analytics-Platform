"""
Event Explorer endpoints for the dashboard: paginated event listing
with an optional event-name filter, plus the list of distinct event
names seen so far (used to populate the filter dropdown).
"""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.response import success_response
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.event import EventFilters
from app.services.event_service import EventService

router = APIRouter(prefix="/projects/{project_id}/events", tags=["events"])


@router.get("")
def list_events(
    project_id: uuid.UUID,
    event_name: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filters = EventFilters(event_name=event_name, page=page, page_size=page_size)
    result = EventService(db).explore(project_id, current_user.id, filters)
    return success_response("Events fetched", result.model_dump())


@router.get("/names")
def list_event_names(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    names = EventService(db).list_event_names(project_id, current_user.id)
    return success_response("Event names fetched", names)
