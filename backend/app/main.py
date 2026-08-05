"""
Application entrypoint. Creates the FastAPI app, wires middleware,
exception handlers, and routers. Run with:

    uvicorn app.main:app --reload
"""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.middleware.exception_handlers import register_exception_handlers
from app.middleware.logging_middleware import RequestLoggingMiddleware

logging.basicConfig(level=logging.INFO)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

register_exception_handlers(app)
app.include_router(api_router)
