"""
Analytics engine: pure functions that turn raw event rows into metrics.
Deliberately decoupled from SQLAlchemy so these are easy to unit test
and reuse (funnels, retention, etc. will build on the same pattern).

Metric definitions:
- DAU/WAU/MAU: distinct users active on / in the 7 / 30 days ending on `reference_date`.
- active_users: distinct users with >=1 event in [start, end].
- new_users: distinct users whose first-ever event (any time) falls in [start, end].
- returning_users: active_users who are not new_users.
- revenue: sum of `revenue_property` across events named `revenue_event` in [start, end].
- conversion_rate: % of active_users who fired `conversion_event` at least once in [start, end].
"""
from datetime import date, datetime, timedelta

import pandas as pd


def _events_to_frame(events: list) -> pd.DataFrame:
    if not events:
        return pd.DataFrame(columns=["distinct_id", "name", "timestamp", "properties"])
    return pd.DataFrame(
        [
            {"distinct_id": e.distinct_id, "name": e.name, "timestamp": e.timestamp, "properties": e.properties}
            for e in events
        ]
    )


def active_user_count(frame: pd.DataFrame, start: datetime, end: datetime) -> int:
    if frame.empty:
        return 0
    mask = (frame["timestamp"] >= start) & (frame["timestamp"] <= end)
    return int(frame.loc[mask, "distinct_id"].nunique())


def new_user_count(first_seen: dict[str, datetime], start: datetime, end: datetime) -> int:
    return sum(1 for ts in first_seen.values() if start <= ts <= end)


def revenue_sum(frame: pd.DataFrame, event_name: str, property_key: str) -> float:
    if frame.empty:
        return 0.0
    matching = frame[frame["name"] == event_name]
    if matching.empty:
        return 0.0
    amounts = matching["properties"].apply(lambda p: float((p or {}).get(property_key, 0) or 0))
    return round(float(amounts.sum()), 2)


def conversion_rate(frame: pd.DataFrame, conversion_event: str, active_users: int) -> float:
    if active_users == 0 or frame.empty:
        return 0.0
    converted = frame.loc[frame["name"] == conversion_event, "distinct_id"].nunique()
    return round((converted / active_users) * 100, 2)


def daily_active_users(frame: pd.DataFrame, start: date, end: date) -> list[tuple[date, int]]:
    """One point per calendar day in [start, end], even days with zero activity."""
    if frame.empty:
        day_counts: dict[date, int] = {}
    else:
        local = frame.copy()
        local["day"] = local["timestamp"].apply(lambda ts: ts.date())
        day_counts = local.groupby("day")["distinct_id"].nunique().to_dict()

    points = []
    current = start
    while current <= end:
        points.append((current, int(day_counts.get(current, 0))))
        current += timedelta(days=1)
    return points
