def test_register_and_login_flow(client):
    r = client.post(
        "/api/v1/auth/register", json={"name": "Ada", "email": "ada@example.com", "password": "supersecret123"}
    )
    assert r.status_code == 200
    body = r.json()
    assert body["success"] is True
    assert "access_token" in body["data"]

    token = body["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r = client.get("/api/v1/auth/profile", headers=headers)
    assert r.status_code == 200
    assert r.json()["data"]["email"] == "ada@example.com"

    r = client.post("/api/v1/auth/login", json={"email": "ada@example.com", "password": "wrongpassword"})
    assert r.status_code == 401

    r = client.post("/api/v1/auth/login", json={"email": "ada@example.com", "password": "supersecret123"})
    assert r.status_code == 200
    assert r.json()["success"] is True


def test_duplicate_registration_rejected(client):
    payload = {"name": "Ada", "email": "ada@example.com", "password": "supersecret123"}
    client.post("/api/v1/auth/register", json=payload)
    r = client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 409


def test_protected_route_requires_token(client):
    r = client.get("/api/v1/auth/profile")
    assert r.status_code == 401


def test_registration_validates_input(client):
    r = client.post("/api/v1/auth/register", json={"name": "A", "email": "not-an-email", "password": "short"})
    assert r.status_code == 422
    assert r.json()["success"] is False
