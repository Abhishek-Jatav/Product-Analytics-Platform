"""
Simple health check endpoint used by Docker and uptime monitors.
"""
from fastapi import APIRouter

from app.core.response import success_response

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check():
    return success_response("Service is healthy", {"status": "ok"})
