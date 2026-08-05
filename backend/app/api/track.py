"""
Ingestion endpoint hit by the tracking SDK. Authenticated via API key,
not JWT, since this is called from the customer's app/browser, not
a logged-in dashboard user. Also broadcasts the event to any dashboard
clients watching the live feed over WebSocket.
"""
import anyio
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.response import success_response
from app.dependencies.api_key import get_project_from_api_key
from app.models.project import Project
from app.schemas.event import TrackEventRequest
from app.services.event_service import EventService
from app.websocket.connection_manager import manager

router = APIRouter(prefix="/track", tags=["events"])


@router.post("")
async def track_event(
    payload: TrackEventRequest,
    db: Session = Depends(get_db),
    project: Project = Depends(get_project_from_api_key),
):
    event = await anyio.to_thread.run_sync(EventService(db).track, project.id, payload)

    await manager.broadcast(
        project.id,
        {
            "type": "event",
            "id": str(event.id),
            "name": event.name,
            "distinct_id": event.distinct_id,
            "properties": event.properties,
            "timestamp": event.timestamp.isoformat(),
        },
    )

    return success_response("Event tracked", event.model_dump())
