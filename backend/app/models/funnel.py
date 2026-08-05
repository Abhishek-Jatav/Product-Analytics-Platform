"""
A funnel is a named, ordered sequence of event names (e.g. "Landing Page
Viewed" -> "Signup" -> "Purchase"). Steps are stored as an ordered JSON
array rather than a separate table, since a funnel's steps are always
read/written together as a unit and never queried independently.
"""
import uuid

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Funnel(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "funnels"

    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    steps: Mapped[list[str]] = mapped_column(JSON, nullable=False)

    project = relationship("Project")
