"""Faculty workspace API schemas."""

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class DailyBriefPayload(BaseModel):
    text: str
    bullets: list[str]


class FacultyKpiItem(BaseModel):
    id: str
    label: str
    value: str
    sub: str | None = None


class AtRiskStudentItem(BaseModel):
    student_id: UUID
    name: str
    roll_no: str
    tier: str
    top_finding: str | None = None


class AttendanceWatchItem(BaseModel):
    student_id: UUID
    name: str
    roll_no: str
    present_rate_pct: float | None = None
    note: str


class CourseProgressItem(BaseModel):
    course_id: UUID
    course_code: str
    course_name: str
    coverage_pct: float
    planned_sessions: int
    delivered_sessions: int
    slippage: bool


class RecentActivityItem(BaseModel):
    id: str
    kind: str
    text: str
    at: datetime


class ImportFreshness(BaseModel):
    is_stale: bool
    message: str | None = None


class HealthFactor(BaseModel):
    label: str
    value: int


class CoachItem(BaseModel):
    title: str
    why: str
    cta: str
    coach_key: str


class BriefActionItem(BaseModel):
    icon: str
    text: str
    link_label: str


class FacultyClassSession(BaseModel):
    id: str
    start_time: str
    title: str
    section: str | None = None
    room: str | None = None
    student_count: int | None = None
    status: str
    status_note: str | None = None
    session_type: str


class AttendanceRegisterItem(BaseModel):
    section: str
    course_code: str
    start_time: str
    status: str


class AttendanceTasksPayload(BaseModel):
    pending: int
    completed: int
    overdue: int
    filled_count: int
    total_count: int
    registers: list[AttendanceRegisterItem]


class ClassPerformanceSubject(BaseModel):
    section: str
    course_code: str
    avg_pct: float
    tone: str


class ClassPerformancePayload(BaseModel):
    avg_internal_pct: float
    delta_pts: float | None = None
    internals_in_days: int | None = None
    subjects: list[ClassPerformanceSubject]
    insight: str


class AssignmentReviewItem(BaseModel):
    id: str
    title: str
    priority: str
    due_label: str
    section: str
    submission_count: int
    graded_count: int


class ApprovalItem(BaseModel):
    id: str
    kind: str
    title: str
    due_label: str


class NavBadges(BaseModel):
    reviews: int
    students: int
    approvals: int


class FlaggedStudentItem(BaseModel):
    student_id: UUID
    name: str
    section: str
    why: str
    based_on: str
    confidence_pct: int
    confidence_label: str
    tier: str


class FacultyDashboardResponse(BaseModel):
    has_scope: bool
    first_name: str = ""
    department_name: str | None = None
    semester_label: str = ""
    session_label: str = ""
    day_summary: str = ""
    health_score: int = 0
    health_label: str = ""
    health_factors: list[HealthFactor] = Field(default_factory=list)
    health_narrative: str = ""
    health_sources: list[str] = Field(default_factory=list)
    daily_brief: DailyBriefPayload
    brief_actions: list[BriefActionItem] = Field(default_factory=list)
    kpis: list[FacultyKpiItem]
    classes_today: list[FacultyClassSession] = Field(default_factory=list)
    coaching_items: list[CoachItem] = Field(default_factory=list)
    attendance_tasks: AttendanceTasksPayload | None = None
    class_performance: ClassPerformancePayload | None = None
    assignment_reviews: list[AssignmentReviewItem] = Field(default_factory=list)
    pending_approvals: list[ApprovalItem] = Field(default_factory=list)
    flagged_students: list[FlaggedStudentItem] = Field(default_factory=list)
    nav_badges: NavBadges = Field(default_factory=lambda: NavBadges(reviews=0, students=0, approvals=0))
    at_risk_students: list[AtRiskStudentItem]
    attendance_watch: list[AttendanceWatchItem]
    course_progress: list[CourseProgressItem]
    recent_activity: list[RecentActivityItem]
    import_freshness: ImportFreshness | None = None


class FacultyArtifactResponse(BaseModel):
    id: UUID
    artifact_type: str
    title: str
    status: str
    content_json: dict
    source_job_id: UUID | None
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FacultyArtifactCreate(BaseModel):
    artifact_type: str = "draft"
    title: str = "Untitled draft"
    content_json: dict = Field(default_factory=dict)


class FacultyArtifactUpdate(BaseModel):
    title: str | None = None
    status: str | None = None
    content_json: dict | None = None


class GenerationJobResponse(BaseModel):
    id: UUID
    feature: str
    params_json: dict
    status: str
    result_artifact_id: UUID | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class GenerateRequest(BaseModel):
    feature: str
    params: dict = Field(default_factory=dict)


class OfficeHourSlotResponse(BaseModel):
    id: UUID
    slot_date: date
    start_time: str
    end_time: str
    location: str | None
    status: str
    booking_note: str | None

    model_config = {"from_attributes": True}


class OfficeHourSlotCreate(BaseModel):
    slot_date: date
    start_time: str
    end_time: str
    location: str | None = None


class CoursePlanResponse(BaseModel):
    id: UUID
    course_id: UUID
    course_code: str
    course_name: str
    syllabus_units: list
    planned_sessions: int
    delivered_sessions: int

    model_config = {"from_attributes": True}


class InterventionCreateRequest(BaseModel):
    student_id: UUID
    type: str
    title: str
    notes: str | None = None
