"""
Every API response follows the same envelope:
    { success, message, data, errors }
This keeps frontend handling consistent across all endpoints.
"""
from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None
    errors: Optional[Any] = None


def success_response(message: str, data: Any = None) -> dict:
    return {"success": True, "message": message, "data": data, "errors": None}


def error_response(message: str, errors: Any = None) -> dict:
    return {"success": False, "message": message, "data": None, "errors": errors}
