"""
Single place that wires up every feature router.
New phases (events, funnels, retention, experiments...) each add
one line here instead of touching main.py.
"""
from fastapi import APIRouter

from app.api.alerts import router as alerts_router
from app.api.analytics import router as analytics_router
from app.api.auth import router as auth_router
from app.api.events import router as events_router
from app.api.experiments import router as experiments_router
from app.api.funnels import router as funnels_router
from app.api.health import router as health_router
from app.api.projects import project_router
from app.api.projects import router as projects_router
from app.api.reports import router as reports_router
from app.api.retention import router as retention_router
from app.api.segments import router as segments_router
from app.api.track import router as track_router
from app.api.websocket import router as websocket_router
from app.api.workspaces import router as workspaces_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(workspaces_router)
api_router.include_router(projects_router)
api_router.include_router(project_router)
api_router.include_router(events_router)
api_router.include_router(analytics_router)
api_router.include_router(funnels_router)
api_router.include_router(retention_router)
api_router.include_router(experiments_router)
api_router.include_router(segments_router)
api_router.include_router(alerts_router)
api_router.include_router(reports_router)
api_router.include_router(track_router)
api_router.include_router(websocket_router)