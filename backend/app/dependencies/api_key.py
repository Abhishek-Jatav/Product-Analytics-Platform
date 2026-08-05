"""
`get_project_from_api_key` dependency: validates the API key sent by the
tracking SDK and resolves it to a Project. Accepts the key either via the
`X-API-Key` header (used by fetch) or an `api_key` query param (used by
navigator.sendBeacon, which cannot set custom headers). This is separate
from JWT auth (`get_current_user`), which is for the dashboard/browser.
"""
from typing import Optional

from fastapi import Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.project import Project
from app.repositories.project_repository import ProjectRepository


def get_project_from_api_key(
    x_api_key: Optional[str] = Header(default=None, alias="X-API-Key"),
    api_key: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
) -> Project:
    key = x_api_key or api_key
    if not key:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing API key")

    record = ProjectRepository(db).get_by_api_key(key)
    if not record:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid API key")
    return record.project
