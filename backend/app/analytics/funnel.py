"""
Funnel analysis: for each user, walks the ordered list of step event
names and finds the earliest matching event for step N that occurs at
or after the timestamp they matched step N-1 at. A user "reaches" step N
only if they reached every step before it, in order. This is what makes
it a funnel rather than just N independent counts.
"""
from typing import Optional

import pandas as pd


def compute_funnel(frame: pd.DataFrame, steps: list[str]) -> list[dict]:
    """
    `frame` must have columns: distinct_id, name, timestamp (already
    filtered to the project + date range under analysis).
    Returns one dict per step: users_reached, conversion %, drop-off,
    and average time (seconds) since the previous step.
    """
    if frame.empty:
        return [_empty_step(i, name) for i, name in enumerate(steps)]

    # For each user, the timestamp they reached each step (or None).
    user_step_times: dict[str, list[Optional[pd.Timestamp]]] = {}

    for distinct_id, user_events in frame.groupby("distinct_id"):
        user_events = user_events.sort_values("timestamp")
        reached: list[Optional[pd.Timestamp]] = []
        floor_ts = None

        for step_name in steps:
            candidates = user_events[user_events["name"] == step_name]
            if floor_ts is not None:
                candidates = candidates[candidates["timestamp"] >= floor_ts]

            if candidates.empty:
                break  # user drops off here; no point checking later steps

            match_ts = candidates["timestamp"].min()
            reached.append(match_ts)
            floor_ts = match_ts

        # Pad with None for steps never reached.
        reached += [None] * (len(steps) - len(reached))
        user_step_times[distinct_id] = reached

    results = []
    users_at_step_0 = sum(1 for times in user_step_times.values() if times[0] is not None)
    prev_count = None

    for i, step_name in enumerate(steps):
        reached_users = [times for times in user_step_times.values() if times[i] is not None]
        count = len(reached_users)

        conversion_from_start = round((count / users_at_step_0) * 100, 2) if users_at_step_0 else 0.0
        conversion_from_previous = 100.0 if i == 0 else (round((count / prev_count) * 100, 2) if prev_count else 0.0)
        drop_off = 0 if i == 0 else max((prev_count or 0) - count, 0)

        avg_time = None
        if i > 0:
            deltas = [
                (times[i] - times[i - 1]).total_seconds()
                for times in user_step_times.values()
                if times[i] is not None and times[i - 1] is not None
            ]
            avg_time = round(sum(deltas) / len(deltas), 2) if deltas else None

        results.append(
            {
                "step_index": i,
                "event_name": step_name,
                "users_reached": count,
                "conversion_from_start": conversion_from_start,
                "conversion_from_previous": conversion_from_previous,
                "drop_off": drop_off,
                "avg_time_from_previous_seconds": avg_time,
            }
        )
        prev_count = count

    return results


def _empty_step(index: int, name: str) -> dict:
    return {
        "step_index": index,
        "event_name": name,
        "users_reached": 0,
        "conversion_from_start": 0.0,
        "conversion_from_previous": 0.0 if index == 0 else 0.0,
        "drop_off": 0,
        "avg_time_from_previous_seconds": None,
    }
