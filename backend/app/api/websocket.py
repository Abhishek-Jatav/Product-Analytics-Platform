"""
Live event feed over WebSocket. Browsers can't set custom headers on a
WebSocket handshake, so the JWT travels as a query param instead of the
usual Authorization header - same tradeoff the tracking SDK makes for
sendBeacon. Auth and project-membership are checked manually here since
this isn't a normal HTTP route and can't use the regular `Depends` auth
dependency chain the same way.
"""
import uuid

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import decode_token
from app.repositories.project_repository import ProjectRepository
from app.repositories.user_repository import UserRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.websocket.connection_manager import manager

router = APIRouter(tags=["realtime"])


def _authenticate(db: Session, token: str, project_id: uuid.UUID) -> bool:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return False

    user = UserRepository(db).get_by_id(payload["sub"])
    if not user or not user.is_active:
        return False

    project = ProjectRepository(db).get_by_id(project_id)
    if not project:
        return False

    membership = WorkspaceRepository(db).get_membership(project.workspace_id, user.id)
    return membership is not None


@router.websocket("/ws/projects/{project_id}/live")
async def live_events(websocket: WebSocket, project_id: uuid.UUID, token: str = Query(...)):
    db = SessionLocal()
    try:
        if not _authenticate(db, token, project_id):
            await websocket.close(code=4001)
            return
    finally:
        db.close()

    await manager.connect(project_id, websocket)
    try:
        while True:
            # Client doesn't need to send anything; this just keeps the
            # connection open and lets us detect disconnects promptly.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(project_id, websocket)
