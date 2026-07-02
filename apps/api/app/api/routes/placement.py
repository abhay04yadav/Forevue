from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, get_current_user, get_tenant_session
from app.schemas.placement import PlacementDriveResponse, PlacementSummaryResponse
from app.services.placement_service import get_summary, list_drives

router = APIRouter(prefix="/placement", tags=["placement"])


@router.get("/summary", response_model=PlacementSummaryResponse)
def placement_summary(
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> PlacementSummaryResponse:
    return get_summary(session, current_user.tenant_id, current_user.role)


@router.get("/drives", response_model=list[PlacementDriveResponse])
def placement_drives(
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> list[PlacementDriveResponse]:
    return list_drives(session, current_user.tenant_id, current_user.role)
