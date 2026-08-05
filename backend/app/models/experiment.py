"""
An experiment splits traffic across named variants (e.g. "Control" /
"Variant B") and tracks which of them converts better on a chosen event.
Exposure and conversion are derived from regular events (an "Experiment
Viewed" event the SDK fires when it buckets a user), not a separate
assignment table — keeps the SDK stateless and server-round-trip-free.
"""
import enum
import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class ExperimentStatus(str, enum.Enum):
    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"


class Experiment(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "experiments"

    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    conversion_event: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[ExperimentStatus] = mapped_column(Enum(ExperimentStatus), default=ExperimentStatus.RUNNING)

    variants = relationship("Variant", back_populates="experiment", cascade="all, delete-orphan", order_by="Variant.created_at")


class Variant(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "variants"

    experiment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("experiments.id"), index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    traffic_allocation: Mapped[int] = mapped_column(Integer, nullable=False)
    is_control: Mapped[bool] = mapped_column(Boolean, default=False)

    experiment = relationship("Experiment", back_populates="variants")
