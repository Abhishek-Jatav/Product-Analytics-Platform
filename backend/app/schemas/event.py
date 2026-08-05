import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class TrackEventRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120, description="e.g. 'Signup', 'Purchase'")
    distinct_id: str = Field(min_length=1, max_length=255, description="Anonymous or known user identifier")
    properties: dict[str, Any] = Field(default_factory=dict)


class EventResponse(BaseModel):
    id: uuid.UUID
    name: str
    distinct_id: str
    properties: dict[str, Any]
    timestamp: datetime

    model_config = {"from_attributes": True}


class EventListResponse(BaseModel):
    items: list[EventResponse]
    total: int
    page: int
    page_size: int


class EventFilters(BaseModel):
    event_name: Optional[str] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=25, ge=1, le=100)
