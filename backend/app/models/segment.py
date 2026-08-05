"""
A segment is a saved, named filter that defines a group of users by
property conditions (e.g. country=US) and/or behavioral conditions
(e.g. fired "Purchase" at least twice). This single model covers both
the PRD's "User Segmentation" (property filters) and "Cohort Analysis"
(behavior filters) - they're the same underlying operation, just with
different condition types.
"""
import uuid

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Segment(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "segments"

    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    conditions: Mapped[list[dict]] = mapped_column(JSON, nullable=False)

    project = relationship("Project")
