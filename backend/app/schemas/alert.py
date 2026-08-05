import uuid
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class CreateAlertRuleRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    metric: Literal["dau", "revenue", "conversion_rate"]
    direction: Literal["drop", "spike"]
    threshold_percent: float = Field(gt=0, le=1000)


class AlertRuleResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    metric: str
    direction: str
    threshold_percent: float
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertCheckResult(BaseModel):
    rule: AlertRuleResponse
    current_value: float
    previous_value: float
    percent_change: Optional[float]
    triggered: bool
    message: str
