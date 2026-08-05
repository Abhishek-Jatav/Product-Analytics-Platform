def test_segment_matches_property_and_event_conditions(client, project_setup, seed_event):
    headers, project_id, _ = project_setup

    seed_event(project_id, "u1", "Signup", {"country": "US"})
    seed_event(project_id, "u1", "Purchase", {"amount": 20, "country": "US"})
    seed_event(project_id, "u2", "Signup", {"country": "US"})  # US but never purchased
    seed_event(project_id, "u3", "Signup", {"country": "CA"})
    seed_event(project_id, "u3", "Purchase", {"amount": 10, "country": "CA"})

    r = client.post(
        f"/api/v1/projects/{project_id}/segments",
        json={
            "name": "US Purchasers",
            "conditions": [
                {"type": "property", "key": "country", "operator": "equals", "value": "US"},
                {"type": "event", "event_name": "Purchase", "operator": "at_least", "count": 1},
            ],
        },
        headers=headers,
    )
    segment_id = r.json()["data"]["id"]

    r = client.get(f"/api/v1/projects/{project_id}/segments/{segment_id}/preview", headers=headers)
    data = r.json()["data"]
    assert data["matching_user_count"] == 1
    assert data["sample_distinct_ids"] == ["u1"]


def test_alert_triggers_on_dau_drop(client, project_setup, seed_event):
    headers, project_id, _ = project_setup

    for i in range(10):
        seed_event(project_id, f"y_{i}", "Login", days_ago=1)
    for i in range(2):
        seed_event(project_id, f"t_{i}", "Login", days_ago=0)

    r = client.post(
        f"/api/v1/projects/{project_id}/alerts",
        json={"name": "DAU Drop", "metric": "dau", "direction": "drop", "threshold_percent": 30},
        headers=headers,
    )
    rule_id = r.json()["data"]["id"]

    r = client.get(f"/api/v1/projects/{project_id}/alerts/{rule_id}/check", headers=headers)
    data = r.json()["data"]
    assert data["current_value"] == 2.0
    assert data["previous_value"] == 10.0
    assert data["percent_change"] == -80.0
    assert data["triggered"] is True
