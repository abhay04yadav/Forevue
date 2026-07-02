from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class PlacementDriveResponse(BaseModel):
    id: UUID
    title: str
    company_name: str
    status: str
    drive_date: date | None
    location: str | None
    created_at: datetime


class PlacementSummaryResponse(BaseModel):
    active_drives: int
    draft_drives: int
    closed_drives: int
    headline: str
    note: str
