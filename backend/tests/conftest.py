"""
Shared pytest fixtures. Each test gets a fresh in-memory SQLite database
(via dependency override) so tests never leak state into each other.
"""
import os
import uuid
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("DATABASE_URL", "sqlite:///./_unused.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key")

from app import models  # noqa: E402,F401  (registers all models on Base.metadata)
from app.core.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models.event import Event  # noqa: E402


@pytest.fixture()
def client():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    test_client = TestClient(app)
    test_client._session_factory = TestingSessionLocal  # stashed for the seed_event fixture below
    yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def register_user(client):
    """Returns a function: register_user(name, email) -> (headers, user_id)."""

    def _register(name: str = "Ada Lovelace", email: str = "ada@example.com"):
        response = client.post(
            "/api/v1/auth/register", json={"name": name, "email": email, "password": "supersecret123"}
        )
        assert response.status_code == 200, response.text
        data = response.json()["data"]
        return {"Authorization": f"Bearer {data['access_token']}"}, data["user"]["id"]

    return _register


@pytest.fixture()
def project_setup(client, register_user):
    """Registers a user, creates a workspace + project. Returns (headers, project_id, api_key)."""
    headers, _ = register_user()

    ws = client.post("/api/v1/workspaces", json={"name": "Acme"}, headers=headers)
    workspace_id = ws.json()["data"]["id"]

    proj = client.post(f"/api/v1/workspaces/{workspace_id}/projects", json={"name": "Web"}, headers=headers)
    project_id = proj.json()["data"]["project"]["id"]
    api_key = proj.json()["data"]["api_key"]["key"]

    return headers, project_id, api_key


@pytest.fixture()
def seed_event(client):
    """Returns a function that inserts an Event directly (bypassing HTTP) with a controllable timestamp."""

    def _seed(project_id: str, distinct_id: str, name: str, properties: dict | None = None, days_ago: int = 0, hour: int = 12):
        db = client._session_factory()
        ts = (datetime.now(timezone.utc) - timedelta(days=days_ago)).replace(hour=hour, minute=0, second=0, microsecond=0)
        db.add(
            Event(
                project_id=uuid.UUID(project_id),
                name=name,
                distinct_id=distinct_id,
                properties=properties or {},
                timestamp=ts,
            )
        )
        db.commit()
        db.close()

    return _seed
