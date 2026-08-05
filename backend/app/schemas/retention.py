from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, Field


class RetentionRatePoint(BaseModel):
    eligible_users: int
    retained_users: int
    rate: float = Field(description="Percentage, 0-100")


class RetentionSummary(BaseModel):
    as_of: date
    day1: RetentionRatePoint
    day7: RetentionRatePoint
    day30: RetentionRatePoint


class RetentionCohortRow(BaseModel):
    cohort_start: date
    cohort_size: int
    percentages: list[Optional[float]] = Field(description="One entry per period offset; null = period hasn't happened yet")


class RetentionMatrix(BaseModel):
    period: Literal["day", "week"]
    num_periods: int
    cohorts: list[RetentionCohortRow]


class RetentionMatrixFilters(BaseModel):
    period: Literal["day", "week"] = "week"
    num_periods: int = Field(default=8, ge=2, le=12)
    max_cohorts: int = Field(default=8, ge=1, le=20)
