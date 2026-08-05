def test_funnel_sequential_matching(client, project_setup, seed_event):
    headers, project_id, _ = project_setup

    r = client.post(
        f"/api/v1/projects/{project_id}/funnels",
        json={"name": "Onboarding", "steps": ["Landing Viewed", "Signup", "Purchase"]},
        headers=headers,
    )
    assert r.status_code == 200
    funnel_id = r.json()["data"]["id"]

    # user_1 completes all steps in order
    seed_event(project_id, "user_1", "Landing Viewed", days_ago=1)
    seed_event(project_id, "user_1", "Signup", days_ago=1, hour=13)
    seed_event(project_id, "user_1", "Purchase", days_ago=1, hour=14)

    # user_2 drops off after signup
    seed_event(project_id, "user_2", "Landing Viewed", days_ago=1)
    seed_event(project_id, "user_2", "Signup", days_ago=1, hour=13)

    # user_3 fires Signup and Purchase but NEVER Landing Viewed - must not count at all
    seed_event(project_id, "user_3", "Signup", days_ago=1)
    seed_event(project_id, "user_3", "Purchase", days_ago=1, hour=13)

    r = client.get(f"/api/v1/projects/{project_id}/funnels/{funnel_id}/analysis", headers=headers)
    steps = r.json()["data"]["steps"]

    assert steps[0]["users_reached"] == 2  # user_1, user_2 (user_3 excluded)
    assert steps[1]["users_reached"] == 2  # user_1, user_2
    assert steps[2]["users_reached"] == 1  # user_1 only
    assert steps[2]["conversion_from_start"] == 50.0


def test_funnel_creation_requires_at_least_two_steps(client, project_setup):
    headers, project_id, _ = project_setup
    r = client.post(
        f"/api/v1/projects/{project_id}/funnels", json={"name": "Bad", "steps": ["OnlyOneStep"]}, headers=headers
    )
    assert r.status_code == 422
