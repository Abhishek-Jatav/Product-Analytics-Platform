"""
Segment evaluation: for each user, checks every condition against their
event history and keeps users who satisfy ALL conditions (AND).

- property conditions look at the `properties` payload of every event
  the user fired, and match if ANY of their events has that property
  matching the operator (e.g. any event with country=US).
- event conditions count how many times the user fired a named event
  and compare against a threshold (at_least / exactly / never).
"""
import pandas as pd


def _matches_property_condition(user_events: pd.DataFrame, condition: dict) -> bool:
    key, op, value = condition.get("key"), condition["operator"], condition.get("value")
    if not key:
        return False

    for props in user_events["properties"]:
        if not props or key not in props:
            continue
        actual = props[key]
        if op == "equals" and str(actual) == str(value):
            return True
        if op == "not_equals" and str(actual) != str(value):
            return True
        if op == "contains" and value is not None and str(value).lower() in str(actual).lower():
            return True
    return False


def _matches_event_condition(user_events: pd.DataFrame, condition: dict) -> bool:
    event_name = condition.get("event_name")
    if not event_name:
        return False

    op = condition["operator"]
    threshold = condition.get("count") or 0
    actual_count = int((user_events["name"] == event_name).sum())

    if op == "at_least":
        return actual_count >= threshold
    if op == "exactly":
        return actual_count == threshold
    if op == "never":
        return actual_count == 0
    return False


def _matches_condition(user_events: pd.DataFrame, condition: dict) -> bool:
    if condition["type"] == "property":
        return _matches_property_condition(user_events, condition)
    return _matches_event_condition(user_events, condition)


def evaluate_segment(frame: pd.DataFrame, conditions: list[dict]) -> list[str]:
    """Returns the distinct_ids of every user who matches ALL conditions."""
    if frame.empty or not conditions:
        return []

    matching_ids = []
    for distinct_id, user_events in frame.groupby("distinct_id"):
        if all(_matches_condition(user_events, c) for c in conditions):
            matching_ids.append(distinct_id)
    return matching_ids
