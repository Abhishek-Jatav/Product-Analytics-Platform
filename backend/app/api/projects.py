"""
Project endpoints, nested under a workspace: create and list projects,
each project creation returns its auto-generated API key.
"""
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.response import success_response
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.project import CreateProjectRequest
from app.services.project_service import ProjectService

router = APIRouter(prefix="/workspaces/{workspace_id}/projects", tags=["projects"])


@router.post("")
def create_project(
    workspace_id: uuid.UUID,
    payload: CreateProjectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = ProjectService(db).create(workspace_id, payload, current_user.id)
    return success_response("Project created successfully", result.model_dump())


@router.get("")
def list_projects(
    workspace_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    projects = ProjectService(db).list_for_workspace(workspace_id, current_user.id)
    return success_response("Projects fetched", [p.model_dump() for p in projects])
