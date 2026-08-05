"""
Segment endpoints: create/list saved segments, and preview which users
currently match one.
"""
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.response import success_response
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.segment import CreateSegmentRequest
from app.services.segment_service import SegmentService

router = APIRouter(prefix="/projects/{project_id}/segments", tags=["segments"])


@router.post("")
def create_segment(
    project_id: uuid.UUID,
    payload: CreateSegmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    segment = SegmentService(db).create(project_id, current_user.id, payload)
    return success_response("Segment created successfully", segment.model_dump())


@router.get("")
def list_segments(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    segments = SegmentService(db).list_for_project(project_id, current_user.id)
    return success_response("Segments fetched", [s.model_dump() for s in segments])


@router.get("/{segment_id}/preview")
def preview_segment(
    project_id: uuid.UUID,
    segment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    preview = SegmentService(db).preview(project_id, segment_id, current_user.id)
    return success_response("Segment preview computed", preview.model_dump())
