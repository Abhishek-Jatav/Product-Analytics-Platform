import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class CreateWorkspaceRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)


class WorkspaceResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    role: str

    model_config = {"from_attributes": True}


class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str = Field(default="member", pattern="^(admin|member)$")


class UpdateMemberRoleRequest(BaseModel):
    role: str = Field(pattern="^(owner|admin|member)$")


class WorkspaceMemberResponse(BaseModel):
    id: uuid.UUID  # membership id, not user id - used to target update/remove calls
    user_id: uuid.UUID
    name: str
    email: str
    role: str
    joined_at: datetime
