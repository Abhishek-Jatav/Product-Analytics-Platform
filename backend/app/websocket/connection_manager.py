"""
In-memory registry of live WebSocket connections, keyed by project ID.
This is a single-process implementation (fine for this scaffold); a
multi-instance deployment would swap this for Redis pub/sub (Redis is
already in the stack) so broadcasts reach clients connected to a
different server process.
"""
import uuid
from typing import Dict, Set

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, project_id: uuid.UUID, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.setdefault(str(project_id), set()).add(websocket)

    def disconnect(self, project_id: uuid.UUID, websocket: WebSocket) -> None:
        connections = self._connections.get(str(project_id))
        if connections:
            connections.discard(websocket)
            if not connections:
                self._connections.pop(str(project_id), None)

    async def broadcast(self, project_id: uuid.UUID, message: dict) -> None:
        connections = self._connections.get(str(project_id))
        if not connections:
            return

        dead: list[WebSocket] = []
        for websocket in connections:
            try:
                await websocket.send_json(message)
            except Exception:
                dead.append(websocket)

        for websocket in dead:
            connections.discard(websocket)


manager = ConnectionManager()
