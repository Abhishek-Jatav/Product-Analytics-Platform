import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class CreateFunnelRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    steps: list[str] = Field(min_length=2, max_length=10, description="Ordered event names")

    @field_validator("steps")
    @classmethod
    def steps_must_be_non_empty_strings(cls, value: list[str]) -> list[str]:
        cleaned = [s.strip() for s in value if s.strip()]
        if len(cleaned) < 2:
            raise ValueError("A funnel needs at least 2 non-empty steps")
        return cleaned


class FunnelResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    steps: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class FunnelStepResult(BaseModel):
    step_index: int
    event_name: str
    users_reached: int
    conversion_from_start: float = Field(description="Percentage, 0-100")
    conversion_from_previous: float = Field(description="Percentage, 0-100")
    drop_off: int
    avg_time_from_previous_seconds: Optional[float] = None


class FunnelAnalysis(BaseModel):
    funnel: FunnelResponse
    start_date: date
    end_date: date
    steps: list[FunnelStepResult]


class FunnelAnalysisFilters(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
