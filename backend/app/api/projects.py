"""
Project endpoints, nested under a workspace: create and list projects,
each project creation returns its auto-generated API key. Also exposes a
lookup route to fetch a project's existing API key at any later time.
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
project_router = APIRouter(prefix="/projects/{project_id}", tags=["projects"])


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


@project_router.get("/api-key")
def get_api_key(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    api_key = ProjectService(db).get_api_key(project_id, current_user.id)
    return success_response("API key fetched", api_key.model_dump())