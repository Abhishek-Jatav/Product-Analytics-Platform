def test_track_event_via_header_and_query_param(client, project_setup):
    headers, project_id, api_key = project_setup

    r = client.post(
        "/api/v1/track",
        json={"name": "Signup", "distinct_id": "user_1", "properties": {"plan": "free"}},
        headers={"X-API-Key": api_key},
    )
    assert r.status_code == 200

    # sendBeacon-style: no header, key as query param
    r = client.post(
        f"/api/v1/track?api_key={api_key}",
        json={"name": "Login", "distinct_id": "user_1", "properties": {}},
    )
    assert r.status_code == 200


def test_track_event_rejects_bad_or_missing_key(client, project_setup):
    _, _, _ = project_setup

    r = client.post("/api/v1/track", json={"name": "X", "distinct_id": "y", "properties": {}})
    assert r.status_code == 401

    r = client.post(
        "/api/v1/track", json={"name": "X", "distinct_id": "y", "properties": {}}, headers={"X-API-Key": "bogus"}
    )
    assert r.status_code == 401


def test_event_explorer_filters_and_paginates(client, project_setup):
    headers, project_id, api_key = project_setup

    for i in range(3):
        client.post(
            "/api/v1/track",
            json={"name": "Signup", "distinct_id": f"user_{i}", "properties": {}},
            headers={"X-API-Key": api_key},
        )
    client.post(
        "/api/v1/track", json={"name": "Login", "distinct_id": "user_0", "properties": {}}, headers={"X-API-Key": api_key}
    )

    r = client.get(f"/api/v1/projects/{project_id}/events", headers=headers)
    assert r.json()["data"]["total"] == 4

    r = client.get(f"/api/v1/projects/{project_id}/events?event_name=Signup", headers=headers)
    assert r.json()["data"]["total"] == 3

    r = client.get(f"/api/v1/projects/{project_id}/events/names", headers=headers)
    assert sorted(r.json()["data"]) == ["Login", "Signup"]


def test_project_isolation_across_users(client, project_setup, register_user):
    _, project_id, _ = project_setup
    other_headers, _ = register_user(name="Eve", email="eve@example.com")

    r = client.get(f"/api/v1/projects/{project_id}/events", headers=other_headers)
    assert r.status_code == 403
