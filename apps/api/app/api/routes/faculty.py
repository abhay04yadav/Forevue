"""Faculty workspace API routes (dashboard, artifacts, generation, teaching)."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, get_current_user, get_tenant_session
from app.core.exceptions import ForbiddenException
from app.models.canonical import Course
from app.models.faculty_workspace import FacultyCoursePlan, OfficeHourSlot
from app.schemas.faculty import (
    CoursePlanResponse,
    FacultyArtifactCreate,
    FacultyArtifactResponse,
    FacultyArtifactUpdate,
    FacultyDashboardResponse,
    GenerateRequest,
    GenerationJobResponse,
    OfficeHourSlotCreate,
    OfficeHourSlotResponse,
)
from app.services.faculty import artifact_service, generation_service
from app.services.faculty_dashboard_service import get_faculty_dashboard
from app.services.risk.scoping import SCOPE_RESOLVED_STAFF_ROLES

router = APIRouter(prefix="/faculty", tags=["faculty"])


def _require_faculty(current_user: CurrentUser) -> None:
    if current_user.role != "faculty":
        raise ForbiddenException("Faculty access only.")


@router.get("/dashboard", response_model=FacultyDashboardResponse)
def faculty_dashboard(
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> FacultyDashboardResponse:
    _require_faculty(current_user)
    return get_faculty_dashboard(session, current_user.tenant_id, current_user.user_id, current_user.role)


@router.get("/artifacts", response_model=list[FacultyArtifactResponse])
def list_artifacts(
    artifact_type: str | None = None,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> list[FacultyArtifactResponse]:
    _require_faculty(current_user)
    rows = artifact_service.list_artifacts(
        session, current_user.tenant_id, current_user.user_id, artifact_type=artifact_type
    )
    return [FacultyArtifactResponse.model_validate(r, from_attributes=True) for r in rows]


@router.post("/artifacts", response_model=FacultyArtifactResponse)
def create_artifact(
    body: FacultyArtifactCreate,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> FacultyArtifactResponse:
    _require_faculty(current_user)
    art = artifact_service.create_artifact(
        session,
        current_user.tenant_id,
        current_user.user_id,
        artifact_type=body.artifact_type,
        title=body.title,
        content_json=body.content_json,
    )
    return FacultyArtifactResponse.model_validate(art, from_attributes=True)


@router.get("/artifacts/{artifact_id}", response_model=FacultyArtifactResponse)
def get_artifact(
    artifact_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> FacultyArtifactResponse:
    _require_faculty(current_user)
    art = artifact_service.get_artifact(
        session,
        current_user.tenant_id,
        artifact_id,
        current_user.user_id,
        is_admin=False,
    )
    return FacultyArtifactResponse.model_validate(art, from_attributes=True)


@router.patch("/artifacts/{artifact_id}", response_model=FacultyArtifactResponse)
def patch_artifact(
    artifact_id: UUID,
    body: FacultyArtifactUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> FacultyArtifactResponse:
    _require_faculty(current_user)
    art = artifact_service.update_artifact(
        session,
        current_user.tenant_id,
        artifact_id,
        current_user.user_id,
        title=body.title,
        status=body.status,
        content_json=body.content_json,
    )
    return FacultyArtifactResponse.model_validate(art, from_attributes=True)


@router.post("/artifacts/{artifact_id}/export")
def export_artifact(
    artifact_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> Response:
    _require_faculty(current_user)
    art = artifact_service.get_artifact(
        session,
        current_user.tenant_id,
        artifact_id,
        current_user.user_id,
        is_admin=False,
    )
    md = artifact_service.export_artifact_markdown(art)
    return Response(
        content=md,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{art.title[:40].replace(" ", "_")}.md"'},
    )


@router.post("/generate", response_model=GenerationJobResponse)
def generate_content(
    body: GenerateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> GenerationJobResponse:
    _require_faculty(current_user)
    job = generation_service.create_generation_job(
        session,
        current_user.tenant_id,
        current_user.user_id,
        feature=body.feature,
        params=body.params,
    )
    return GenerationJobResponse.model_validate(job, from_attributes=True)


@router.get("/jobs", response_model=list[GenerationJobResponse])
def list_jobs(
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> list[GenerationJobResponse]:
    _require_faculty(current_user)
    jobs = generation_service.list_jobs(session, current_user.tenant_id, current_user.user_id)
    return [GenerationJobResponse.model_validate(j, from_attributes=True) for j in jobs]


@router.get("/jobs/{job_id}", response_model=GenerationJobResponse)
def get_job(
    job_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> GenerationJobResponse:
    _require_faculty(current_user)
    job = generation_service.get_job(session, current_user.tenant_id, current_user.user_id, job_id)
    return GenerationJobResponse.model_validate(job, from_attributes=True)


@router.get("/course-plans", response_model=list[CoursePlanResponse])
def list_course_plans(
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> list[CoursePlanResponse]:
    _require_faculty(current_user)
    rows = session.execute(
        select(FacultyCoursePlan, Course)
        .join(Course, Course.id == FacultyCoursePlan.course_id)
        .where(
            FacultyCoursePlan.tenant_id == current_user.tenant_id,
            FacultyCoursePlan.owner_user_id == current_user.user_id,
            FacultyCoursePlan.is_deleted.is_(False),
        )
    ).all()
    out: list[CoursePlanResponse] = []
    for plan, course in rows:
        out.append(
            CoursePlanResponse(
                id=plan.id,
                course_id=course.id,
                course_code=course.code,
                course_name=course.name,
                syllabus_units=plan.syllabus_units,
                planned_sessions=plan.planned_sessions,
                delivered_sessions=plan.delivered_sessions,
            )
        )
    return out


@router.get("/office-hours", response_model=list[OfficeHourSlotResponse])
def list_office_hours(
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> list[OfficeHourSlotResponse]:
    _require_faculty(current_user)
    slots = session.execute(
        select(OfficeHourSlot)
        .where(
            OfficeHourSlot.tenant_id == current_user.tenant_id,
            OfficeHourSlot.owner_user_id == current_user.user_id,
            OfficeHourSlot.is_deleted.is_(False),
        )
        .order_by(OfficeHourSlot.slot_date)
    ).scalars().all()
    return [OfficeHourSlotResponse.model_validate(s, from_attributes=True) for s in slots]


@router.post("/office-hours", response_model=OfficeHourSlotResponse)
def create_office_hour(
    body: OfficeHourSlotCreate,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> OfficeHourSlotResponse:
    _require_faculty(current_user)
    slot = OfficeHourSlot(
        tenant_id=current_user.tenant_id,
        owner_user_id=current_user.user_id,
        slot_date=body.slot_date,
        start_time=body.start_time,
        end_time=body.end_time,
        location=body.location,
        status="open",
    )
    session.add(slot)
    session.flush()
    return OfficeHourSlotResponse.model_validate(slot, from_attributes=True)
