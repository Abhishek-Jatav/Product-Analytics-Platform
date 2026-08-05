def test_team_permission_matrix(client, register_user):
    owner_headers, _ = register_user(name="Owner", email="owner@example.com")
    member_headers, _ = register_user(name="Bob", email="bob@example.com")
    outsider_headers, _ = register_user(name="Eve", email="eve@example.com")

    r = client.post("/api/v1/workspaces", json={"name": "Acme"}, headers=owner_headers)
    workspace_id = r.json()["data"]["id"]

    r = client.post(
        f"/api/v1/workspaces/{workspace_id}/members", json={"email": "bob@example.com", "role": "member"}, headers=owner_headers
    )
    assert r.status_code == 200
    bob_member_id = r.json()["data"]["id"]

    # Duplicate invite rejected
    r = client.post(
        f"/api/v1/workspaces/{workspace_id}/members", json={"email": "bob@example.com", "role": "member"}, headers=owner_headers
    )
    assert r.status_code == 409

    # Non-admin can't invite
    r = client.post(
        f"/api/v1/workspaces/{workspace_id}/members", json={"email": "eve@example.com", "role": "member"}, headers=member_headers
    )
    assert r.status_code == 403

    # Outsider can't list members
    r = client.get(f"/api/v1/workspaces/{workspace_id}/members", headers=outsider_headers)
    assert r.status_code == 403

    # Only owner can change roles
    r = client.patch(f"/api/v1/workspaces/{workspace_id}/members/{bob_member_id}", json={"role": "admin"}, headers=member_headers)
    assert r.status_code == 403

    r = client.patch(f"/api/v1/workspaces/{workspace_id}/members/{bob_member_id}", json={"role": "admin"}, headers=owner_headers)
    assert r.status_code == 200
    assert r.json()["data"]["role"] == "admin"

    # Last owner can't be demoted or removed
    r = client.get(f"/api/v1/workspaces/{workspace_id}/members", headers=owner_headers)
    owner_member_id = next(m["id"] for m in r.json()["data"] if m["email"] == "owner@example.com")

    r = client.patch(f"/api/v1/workspaces/{workspace_id}/members/{owner_member_id}", json={"role": "member"}, headers=owner_headers)
    assert r.status_code == 400

    r = client.delete(f"/api/v1/workspaces/{workspace_id}/members/{owner_member_id}", headers=member_headers)
    assert r.status_code == 400
