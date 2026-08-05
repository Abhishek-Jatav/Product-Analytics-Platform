"""
Retention analysis: two complementary views over the same underlying data.

- Day-N retention: of users whose first-ever event was N+ days ago, what
  % had another event on exactly day N after that first event?
- Cohort matrix: group users by the period (day/week) their first event
  fell in, then for each cohort, what % were active in each subsequent
  period? This is the classic retention heatmap.

Both need a user's FULL event history (not a bounded date range) since
"did they come back" requires looking arbitrarily far past their first event.
"""
from datetime import date, datetime, timedelta

import pandas as pd


def _period_start(d: date, period: str) -> date:
    if period == "day":
        return d
    return d - timedelta(days=d.weekday())  # Monday-anchored week


def _period_length(period: str) -> timedelta:
    return timedelta(days=1) if period == "day" else timedelta(days=7)


def compute_day_n_retention(
    frame: pd.DataFrame, first_seen: dict[str, datetime], day_n: int, as_of: date
) -> dict:
    """% of users who returned on exactly day N after their first event.
    Only counts users whose day N has actually occurred by `as_of`."""
    if frame.empty or not first_seen:
        return {"eligible_users": 0, "retained_users": 0, "rate": 0.0}

    active_dates_by_user: dict[str, set] = {}
    for distinct_id, group in frame.groupby("distinct_id"):
        active_dates_by_user[distinct_id] = set(ts.date() for ts in group["timestamp"])

    eligible = 0
    retained = 0
    for distinct_id, first_ts in first_seen.items():
        target_date = first_ts.date() + timedelta(days=day_n)
        if target_date > as_of:
            continue  # hasn't reached day N yet
        eligible += 1
        if target_date in active_dates_by_user.get(distinct_id, set()):
            retained += 1

    rate = round((retained / eligible) * 100, 2) if eligible else 0.0
    return {"eligible_users": eligible, "retained_users": retained, "rate": rate}


def compute_retention_matrix(
    frame: pd.DataFrame,
    first_seen: dict[str, datetime],
    period: str,
    num_periods: int,
    max_cohorts: int,
    as_of: date,
) -> list[dict]:
    """Groups users into cohorts by when they first showed up, then measures
    what fraction of each cohort was active in each subsequent period."""
    if not first_seen:
        return []

    period_len = _period_length(period)

    cohort_of: dict[str, date] = {
        distinct_id: _period_start(ts.date(), period) for distinct_id, ts in first_seen.items()
    }

    active_periods_by_user: dict[str, set] = {}
    if not frame.empty:
        for distinct_id, group in frame.groupby("distinct_id"):
            active_periods_by_user[distinct_id] = set(_period_start(ts.date(), period) for ts in group["timestamp"])

    users_by_cohort: dict[date, list[str]] = {}
    for distinct_id, cohort_start in cohort_of.items():
        users_by_cohort.setdefault(cohort_start, []).append(distinct_id)

    cohort_starts = sorted(users_by_cohort.keys(), reverse=True)[:max_cohorts]

    rows = []
    for cohort_start in sorted(cohort_starts):
        users = users_by_cohort[cohort_start]
        cohort_size = len(users)
        percentages: list[float | None] = []

        for offset in range(num_periods):
            period_date = cohort_start + (period_len * offset)
            if period_date > as_of:
                percentages.append(None)  # this period hasn't happened yet for this cohort
                continue

            retained = sum(1 for u in users if period_date in active_periods_by_user.get(u, set()))
            percentages.append(round((retained / cohort_size) * 100, 2) if cohort_size else 0.0)

        rows.append({"cohort_start": cohort_start, "cohort_size": cohort_size, "percentages": percentages})

    return rows
