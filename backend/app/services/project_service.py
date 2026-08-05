"""
Business logic for creating projects and their default API key.
Always checks workspace membership before acting.
"""
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.project_repository import ProjectRepository
from app.schemas.project import APIKeyResponse, CreateProjectRequest, ProjectResponse, ProjectWithKeyResponse
from app.services.workspace_service import WorkspaceService
from app.utils.api_key import generate_api_key


class ProjectService:
    def __init__(self, db: Session):
        self.repo = ProjectRepository(db)
        self.workspace_service = WorkspaceService(db)

    def create(self, workspace_id: uuid.UUID, payload: CreateProjectRequest, user_id: uuid.UUID) -> ProjectWithKeyResponse:
        self.workspace_service.assert_member(workspace_id, user_id)

        project = self.repo.create(workspace_id=workspace_id, name=payload.name)
        api_key = self.repo.create_api_key(project_id=project.id, key=generate_api_key())

        return ProjectWithKeyResponse(
            project=ProjectResponse.model_validate(project),
            api_key=APIKeyResponse.model_validate(api_key),
        )

    def list_for_workspace(self, workspace_id: uuid.UUID, user_id: uuid.UUID) -> list[ProjectResponse]:
        self.workspace_service.assert_member(workspace_id, user_id)
        projects = self.repo.list_for_workspace(workspace_id)
        return [ProjectResponse.model_validate(p) for p in projects]

    def get_owned_project(self, project_id: uuid.UUID, user_id: uuid.UUID):
        project = self.repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
        self.workspace_service.assert_member(project.workspace_id, user_id)
        return project
