"""
Project = a tracked product inside a workspace. Events, funnels, and
experiments all belong to a project. Each project has an API key used
by the event-tracking SDK.
"""
import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Project(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "projects"

    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id"))
    name: Mapped[str] = mapped_column(String(120), nullable=False)

    workspace = relationship("Workspace", back_populates="projects")
    api_keys = relationship("APIKey", back_populates="project", cascade="all, delete-orphan")


class APIKey(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "api_keys"

    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"))
    key: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(120), default="Default")

    project = relationship("Project", back_populates="api_keys")
