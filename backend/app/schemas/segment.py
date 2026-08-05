import uuid
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class SegmentCondition(BaseModel):
    """
    Either a property condition (e.g. country=US, seen on any event) or
    an event condition (e.g. fired "Purchase" at least 2 times). All
    conditions in a segment are combined with AND.
    """

    type: Literal["property", "event"]

    # property conditions
    key: Optional[str] = Field(default=None, description="Property key, e.g. 'country'")
    operator: Literal["equals", "not_equals", "contains", "at_least", "exactly", "never"] = "equals"
    value: Optional[str] = None

    # event conditions
    event_name: Optional[str] = None
    count: Optional[int] = Field(default=1, ge=0)


class CreateSegmentRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    conditions: list[SegmentCondition] = Field(min_length=1, max_length=10)


class SegmentResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    conditions: list[SegmentCondition]
    created_at: datetime

    model_config = {"from_attributes": True}


class SegmentPreview(BaseModel):
    segment: SegmentResponse
    matching_user_count: int
    sample_distinct_ids: list[str]
