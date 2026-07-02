from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenException
from app.models.placement import PlacementDrive
from app.schemas.placement import PlacementDriveResponse, PlacementSummaryResponse

PLACEMENT_ROLES = frozenset({"placement", "admin"})


def _ensure_placement_role(role: str) -> None:
    if role not in PLACEMENT_ROLES:
        raise ForbiddenException("Placement role required.")


def list_drives(session: Session, tenant_id: UUID, role: str) -> list[PlacementDriveResponse]:
    _ensure_placement_role(role)
    rows = (
        session.execute(
            select(PlacementDrive).where(
                PlacementDrive.tenant_id == tenant_id,
                PlacementDrive.is_deleted.is_(False),
            )
        )
        .scalars()
        .all()
    )
    return [PlacementDriveResponse.model_validate(row, from_attributes=True) for row in rows]


def get_summary(session: Session, tenant_id: UUID, role: str) -> PlacementSummaryResponse:
    _ensure_placement_role(role)
    rows = (
        session.execute(
            select(PlacementDrive.status, func.count())
            .where(PlacementDrive.tenant_id == tenant_id, PlacementDrive.is_deleted.is_(False))
            .group_by(PlacementDrive.status)
        )
        .all()
    )
    counts = {status: count for status, count in rows}
    active = counts.get("active", 0)
    draft = counts.get("draft", 0)
    closed = counts.get("closed", 0)
    if active + draft + closed == 0:
        return PlacementSummaryResponse(
            active_drives=0,
            draft_drives=0,
            closed_drives=0,
            headline="No placement drives yet",
            note="Drives will appear here once recruiting data is connected or seeded for the tenant.",
        )
    return PlacementSummaryResponse(
        active_drives=active,
        draft_drives=draft,
        closed_drives=closed,
        headline=f"{active} active drive{'s' if active != 1 else ''} on the calendar",
        note="Operational placement dashboard — advisory and human-confirmed actions only.",
    )
