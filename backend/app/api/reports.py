"""
Reports: CSV export of a project's events. PDF export and scheduled
reports (from the PRD) aren't implemented - PDF generation and a job
scheduler are both real infrastructure additions beyond this scaffold's
scope, so this deliberately ships the CSV path end-to-end rather than
stubbing out formats that don't actually work.
"""
import csv
import io
import uuid
from datetime import date, datetime, time
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories.analytics_repository import AnalyticsRepository
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects/{project_id}/reports", tags=["reports"])


@router.get("/events.csv")
def export_events_csv(
    project_id: uuid.UUID,
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ProjectService(db).get_owned_project(project_id, current_user.id)

    end = end_date or date.today()
    start = start_date or end
    start_dt, end_dt = datetime.combine(start, time.min), datetime.combine(end, time.max)

    events = AnalyticsRepository(db).get_events_in_range(project_id, start_dt, end_dt)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["event_name", "distinct_id", "timestamp", "properties"])
    for event in events:
        writer.writerow([event.name, event.distinct_id, event.timestamp.isoformat(), event.properties])
    buffer.seek(0)

    filename = f"events_{start}_{end}.csv"
    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
