from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, get_current_user, get_tenant_session
from app.api.student_scope import assert_student_self_scope
from app.core.exceptions import NotFoundException
from app.models.canonical import Student
from app.schemas.student_dashboard import (
    AssignmentsListResponse,
    AttendanceDetailResponse,
    CampusAnnouncementResponse,
    CareerProfileResponse,
    ExamPrepResponse,
    FeesDetailResponse,
    Student360Response,
    StudentActivityResponse,
    StudentDashboardResponse,
    StudentNotificationResponse,
    TimetableDayResponse,
)
from app.services.student_dashboard_service import (
    build_student_360,
    get_activity,
    get_assignments,
    get_attendance_detail,
    get_campus_announcements,
    get_career_profile,
    get_exam_prep,
    get_fees_detail,
    get_notifications,
    get_student_dashboard,
    get_timetable_day,
)

router = APIRouter(prefix="/students", tags=["students"])
campus_router = APIRouter(prefix="/campus", tags=["campus"])


def _get_student_or_404(session: Session, tenant_id: UUID, student_id: UUID) -> Student:
    student = session.execute(
        select(Student).where(Student.tenant_id == tenant_id, Student.id == student_id)
    ).scalar_one_or_none()
    if student is None:
        raise NotFoundException("Student not found.")
    return student


@router.get("/{student_id}", response_model=Student360Response)
def get_student_360(
    student_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> Student360Response:
    assert_student_self_scope(session, current_user, student_id)
    student = _get_student_or_404(session, current_user.tenant_id, student_id)
    return build_student_360(session, current_user.tenant_id, student)


@router.get("/{student_id}/dashboard", response_model=StudentDashboardResponse)
def get_dashboard(
    student_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> StudentDashboardResponse:
    assert_student_self_scope(session, current_user, student_id)
    _get_student_or_404(session, current_user.tenant_id, student_id)
    return get_student_dashboard(session, current_user.tenant_id, student_id)


@router.get("/{student_id}/timetable", response_model=TimetableDayResponse)
def get_timetable(
    student_id: UUID,
    date: date | None = Query(default=None),
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> TimetableDayResponse:
    assert_student_self_scope(session, current_user, student_id)
    _get_student_or_404(session, current_user.tenant_id, student_id)
    return get_timetable_day(session, current_user.tenant_id, student_id, date)


@router.get("/{student_id}/assignments", response_model=AssignmentsListResponse)
def list_assignments(
    student_id: UUID,
    status: str | None = Query(default=None),
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> AssignmentsListResponse:
    assert_student_self_scope(session, current_user, student_id)
    _get_student_or_404(session, current_user.tenant_id, student_id)
    return get_assignments(session, current_user.tenant_id, student_id, status)


@router.get("/{student_id}/attendance", response_model=AttendanceDetailResponse)
def get_attendance(
    student_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> AttendanceDetailResponse:
    assert_student_self_scope(session, current_user, student_id)
    _get_student_or_404(session, current_user.tenant_id, student_id)
    return get_attendance_detail(session, current_user.tenant_id, student_id)


@router.get("/{student_id}/exam-prep", response_model=ExamPrepResponse)
def get_exam_prep_route(
    student_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> ExamPrepResponse:
    assert_student_self_scope(session, current_user, student_id)
    _get_student_or_404(session, current_user.tenant_id, student_id)
    return get_exam_prep(session, current_user.tenant_id, student_id)


@router.get("/{student_id}/career", response_model=CareerProfileResponse)
def get_career(
    student_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> CareerProfileResponse:
    assert_student_self_scope(session, current_user, student_id)
    _get_student_or_404(session, current_user.tenant_id, student_id)
    return get_career_profile(session, current_user.tenant_id, student_id)


@router.get("/{student_id}/fees", response_model=FeesDetailResponse)
def get_student_fees(
    student_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> FeesDetailResponse:
    assert_student_self_scope(session, current_user, student_id)
    _get_student_or_404(session, current_user.tenant_id, student_id)
    return get_fees_detail(session, current_user.tenant_id, student_id)


@router.get("/{student_id}/notifications", response_model=list[StudentNotificationResponse])
def list_notifications(
    student_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> list[StudentNotificationResponse]:
    assert_student_self_scope(session, current_user, student_id)
    _get_student_or_404(session, current_user.tenant_id, student_id)
    return get_notifications(session, current_user.tenant_id, student_id)


@router.get("/{student_id}/activity", response_model=list[StudentActivityResponse])
def list_activity(
    student_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> list[StudentActivityResponse]:
    assert_student_self_scope(session, current_user, student_id)
    _get_student_or_404(session, current_user.tenant_id, student_id)
    return get_activity(session, current_user.tenant_id, student_id)


@campus_router.get("/announcements", response_model=list[CampusAnnouncementResponse])
def list_campus_announcements(
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> list[CampusAnnouncementResponse]:
    return get_campus_announcements(session, current_user.tenant_id)
