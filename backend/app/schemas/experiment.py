import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class VariantInput(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    traffic_allocation: int = Field(ge=1, le=100)


class CreateExperimentRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    conversion_event: str = Field(min_length=1, max_length=120)
    variants: list[VariantInput] = Field(min_length=2, max_length=6)

    @field_validator("variants")
    @classmethod
    def allocations_must_sum_to_100(cls, value: list[VariantInput]) -> list[VariantInput]:
        total = sum(v.traffic_allocation for v in value)
        if total != 100:
            raise ValueError(f"Variant traffic allocations must sum to 100 (got {total})")
        return value


class VariantResponse(BaseModel):
    id: uuid.UUID
    name: str
    traffic_allocation: int
    is_control: bool

    model_config = {"from_attributes": True}


class ExperimentResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    conversion_event: str
    status: str
    variants: list[VariantResponse]
    created_at: datetime

    model_config = {"from_attributes": True}


class VariantResult(BaseModel):
    variant_id: uuid.UUID
    name: str
    is_control: bool
    exposures: int
    conversions: int
    conversion_rate: float = Field(description="Percentage, 0-100")
    uplift_vs_control: Optional[float] = Field(default=None, description="Percentage points vs control")
    p_value: Optional[float] = None
    is_significant: bool = False


class ExperimentResults(BaseModel):
    experiment: ExperimentResponse
    variants: list[VariantResult]
    winner_variant_id: Optional[uuid.UUID] = None
