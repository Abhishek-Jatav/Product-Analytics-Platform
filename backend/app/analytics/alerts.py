"""
Alert evaluation: compares a metric's value "yesterday" vs "the day
before" and flags it if the change crosses the rule's threshold in the
watched direction. Reuses the same metric functions as the dashboard
(app/analytics/metrics.py) so an alert's numbers always match what the
user sees on the Overview page for the same day.

Note: this only *computes* whether a rule is currently triggered, on
demand (see /check endpoint). Wiring this to a scheduler + actual
notification delivery (email/Slack/webhook) is a natural next step but
out of scope here since this environment has no outbound mail/queue
infrastructure to send through.
"""
from datetime import date, datetime, time
from typing import Optional

import pandas as pd

from app.analytics import metrics as metrics_engine

DEFAULT_CONVERSION_EVENT = "Purchase"
DEFAULT_REVENUE_EVENT = "Purchase"
DEFAULT_REVENUE_PROPERTY = "amount"


def _day_bounds(d: date) -> tuple[datetime, datetime]:
    return datetime.combine(d, time.min), datetime.combine(d, time.max)


def _metric_value(frame: pd.DataFrame, metric: str, d: date) -> float:
    start, end = _day_bounds(d)

    if metric == "dau":
        return float(metrics_engine.active_user_count(frame, start, end))

    if metric == "revenue":
        day_frame = frame[(frame["timestamp"] >= start) & (frame["timestamp"] <= end)]
        return metrics_engine.revenue_sum(day_frame, DEFAULT_REVENUE_EVENT, DEFAULT_REVENUE_PROPERTY)

    if metric == "conversion_rate":
        day_frame = frame[(frame["timestamp"] >= start) & (frame["timestamp"] <= end)]
        active = metrics_engine.active_user_count(frame, start, end)
        return metrics_engine.conversion_rate(day_frame, DEFAULT_CONVERSION_EVENT, active)

    raise ValueError(f"Unknown metric: {metric}")


def evaluate_alert(frame: pd.DataFrame, metric: str, direction: str, threshold_percent: float, as_of: date) -> dict:
    current_day = as_of
    previous_day = date.fromordinal(as_of.toordinal() - 1)

    current_value = _metric_value(frame, metric, current_day)
    previous_value = _metric_value(frame, metric, previous_day)

    percent_change: Optional[float]
    if previous_value == 0:
        percent_change = None if current_value == 0 else 100.0
    else:
        percent_change = round(((current_value - previous_value) / previous_value) * 100, 2)

    triggered = False
    if percent_change is not None:
        if direction == "drop":
            triggered = percent_change <= -threshold_percent
        elif direction == "spike":
            triggered = percent_change >= threshold_percent

    if triggered:
        verb = "dropped" if direction == "drop" else "spiked"
        message = f"{metric} {verb} {abs(percent_change)}% vs the previous day (threshold: {threshold_percent}%)"
    else:
        message = "No threshold breach detected."

    return {
        "current_value": round(current_value, 2),
        "previous_value": round(previous_value, 2),
        "percent_change": percent_change,
        "triggered": triggered,
        "message": message,
    }
