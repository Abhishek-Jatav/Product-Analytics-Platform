"""
Direct DB access for projects and their API keys.
"""
import uuid
from typing import Optional, Sequence

from sqlalchemy.orm import Session

from app.models.project import APIKey, Project


class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, workspace_id: uuid.UUID, name: str) -> Project:
        project = Project(workspace_id=workspace_id, name=name)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def list_for_workspace(self, workspace_id: uuid.UUID) -> Sequence[Project]:
        return self.db.query(Project).filter(Project.workspace_id == workspace_id).all()

    def get_by_id(self, project_id: uuid.UUID) -> Optional[Project]:
        return self.db.query(Project).filter(Project.id == project_id).first()

    def create_api_key(self, project_id: uuid.UUID, key: str, label: str = "Default") -> APIKey:
        api_key = APIKey(project_id=project_id, key=key, label=label)
        self.db.add(api_key)
        self.db.commit()
        self.db.refresh(api_key)
        return api_key

    def get_by_api_key(self, key: str) -> Optional[APIKey]:
        return self.db.query(APIKey).filter(APIKey.key == key).first()
