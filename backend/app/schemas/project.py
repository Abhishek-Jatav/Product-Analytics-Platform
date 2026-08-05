import uuid

from pydantic import BaseModel, Field


class CreateProjectRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)


class ProjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    workspace_id: uuid.UUID

    model_config = {"from_attributes": True}


class APIKeyResponse(BaseModel):
    id: uuid.UUID
    key: str
    label: str

    model_config = {"from_attributes": True}


class ProjectWithKeyResponse(BaseModel):
    project: ProjectResponse
    api_key: APIKeyResponse
