"""
A single tracked event (e.g. "Signup", "Purchase"). `properties` holds
arbitrary event metadata as JSON so the schema doesn't need to change
per event type. `distinct_id` identifies the end user/session emitting it.
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, JSON, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import UUIDMixin


class Event(Base, UUIDMixin):
    __tablename__ = "events"
    __table_args__ = (
        Index("ix_events_project_name", "project_id", "name"),
        Index("ix_events_project_timestamp", "project_id", "timestamp"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    distinct_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    properties: Mapped[dict] = mapped_column(JSON, default=dict)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)

    project = relationship("Project")
