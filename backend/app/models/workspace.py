"""
Workspace = top-level tenant. Users join workspaces through WorkspaceMember
with a role (owner / admin / member) so we support multi-workspace + teams.
"""
import enum
import uuid

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class WorkspaceRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


class Workspace(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "workspaces"

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True, nullable=False)

    members = relationship("WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="workspace", cascade="all, delete-orphan")


class WorkspaceMember(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "workspace_members"

    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id"))
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    role: Mapped[WorkspaceRole] = mapped_column(Enum(WorkspaceRole), default=WorkspaceRole.MEMBER)

    workspace = relationship("Workspace", back_populates="members")
    user = relationship("User", back_populates="memberships")
