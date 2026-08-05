"""
An alert rule watches one metric (DAU, revenue, or conversion rate) and
flags when it drops or spikes by more than a threshold, day over day.
Evaluation happens on demand via the /check endpoint (no background
scheduler or notification delivery in this environment - see the
service module docstring for what a production version would add).
"""
import enum
import uuid

from sqlalchemy import Enum, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class AlertMetric(str, enum.Enum):
    DAU = "dau"
    REVENUE = "revenue"
    CONVERSION_RATE = "conversion_rate"


class AlertDirection(str, enum.Enum):
    DROP = "drop"
    SPIKE = "spike"


class AlertRule(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "alert_rules"

    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    metric: Mapped[AlertMetric] = mapped_column(Enum(AlertMetric), nullable=False)
    direction: Mapped[AlertDirection] = mapped_column(Enum(AlertDirection), nullable=False)
    threshold_percent: Mapped[float] = mapped_column(Float, nullable=False)

    project = relationship("Project")
