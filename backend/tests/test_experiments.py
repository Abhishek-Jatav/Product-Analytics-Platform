def test_experiment_allocations_must_sum_to_100(client, project_setup):
    headers, project_id, _ = project_setup
    r = client.post(
        f"/api/v1/projects/{project_id}/experiments",
        json={
            "name": "Bad",
            "conversion_event": "Purchase",
            "variants": [{"name": "A", "traffic_allocation": 40}, {"name": "B", "traffic_allocation": 40}],
        },
        headers=headers,
    )
    assert r.status_code == 422


def test_experiment_detects_significant_winner(client, project_setup, seed_event):
    headers, project_id, _ = project_setup

    r = client.post(
        f"/api/v1/projects/{project_id}/experiments",
        json={
            "name": "Button Color",
            "conversion_event": "Purchase",
            "variants": [{"name": "Control", "traffic_allocation": 50}, {"name": "Variant B", "traffic_allocation": 50}],
        },
        headers=headers,
    )
    experiment_id = r.json()["data"]["id"]

    # Control: 100 exposed, 10 converted. Variant B: 100 exposed, 25 converted.
    for i in range(100):
        seed_event(project_id, f"ctrl_{i}", "Experiment Viewed", {"experiment_id": experiment_id, "variant": "Control"}, days_ago=1)
        if i < 10:
            seed_event(project_id, f"ctrl_{i}", "Purchase", {"amount": 9.99}, days_ago=1, hour=13)
    for i in range(100):
        seed_event(project_id, f"var_{i}", "Experiment Viewed", {"experiment_id": experiment_id, "variant": "Variant B"}, days_ago=1)
        if i < 25:
            seed_event(project_id, f"var_{i}", "Purchase", {"amount": 9.99}, days_ago=1, hour=13)

    r = client.get(f"/api/v1/projects/{project_id}/experiments/{experiment_id}/results", headers=headers)
    data = r.json()["data"]

    control = next(v for v in data["variants"] if v["is_control"])
    variant_b = next(v for v in data["variants"] if not v["is_control"])

    assert control["exposures"] == 100 and control["conversions"] == 10
    assert variant_b["exposures"] == 100 and variant_b["conversions"] == 25
    assert variant_b["is_significant"] is True
    assert data["winner_variant_id"] == variant_b["variant_id"]
