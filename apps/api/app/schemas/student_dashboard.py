from datetime import date, datetime, time
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class CourseRef(BaseModel):
    id: UUID
    code: str
    name: str


class AttendanceSummary(BaseModel):
    course_id: UUID
    course_code: str | None = None
    course_name: str | None = None
    total_sessions: int
    present_sessions: int
    percentage: float


class InternalMarkSummary(BaseModel):
    course_id: UUID | None
    course_code: str | None = None
    course_name: str | None = None
    assessment_type: str
    attempt: int
    max_marks: Decimal
    obtained: Decimal


class FeeSummary(BaseModel):
    term: str
    fee_head: str
    amount_due: Decimal | None
    amount_paid: Decimal | None
    status: str | None


class FeeLineItem(BaseModel):
    term: str
    fee_head: str
    amount_due: Decimal | None
    amount_paid: Decimal | None
    due_date: date | None
    status: str | None
    balance: Decimal | None


class FeesDetailResponse(BaseModel):
    total_due: Decimal
    total_paid: Decimal
    total_balance: Decimal
    overdue_count: int
    note: str
    items: list[FeeLineItem]


class Student360Response(BaseModel):
    id: UUID
    canonical_roll_no: str
    name: str
    dob: date | None
    gender: str | None
    category: str | None
    email: str | None
    phone: str | None
    admission_year: int | None
    programme_id: UUID | None
    programme_name: str | None = None
    status: str | None
    attendance_summary: list[AttendanceSummary]
    marks: list[InternalMarkSummary]
    fees: list[FeeSummary]
    course_lookup: dict[str, CourseRef] = Field(default_factory=dict)


class TimetableSessionResponse(BaseModel):
    id: UUID
    course_id: UUID | None
    course_code: str | None = None
    course_name: str | None = None
    session_date: date
    start_time: time
    end_time: time | None
    session_type: str
    title: str
    room: str | None
    faculty_name: str | None
    notes: str | None
    status: str  # done | now | next | free | urgent


class TimetableDayResponse(BaseModel):
    date: date
    summary: str
    sessions: list[TimetableSessionResponse]


class AssignmentResponse(BaseModel):
    id: UUID
    course_id: UUID
    course_code: str | None = None
    course_name: str | None = None
    title: str
    due_at: datetime
    due_label: str
    status: str
    progress_pct: int
    priority: str


class AssignmentsListResponse(BaseModel):
    open_count: int
    items: list[AssignmentResponse]


class AttendanceCourseDetail(BaseModel):
    course_id: UUID
    course_code: str
    course_name: str
    percentage: float
    present_sessions: int
    total_sessions: int
    below_threshold: bool


class AttendanceDetailResponse(BaseModel):
    overall_pct: float
    required_pct: float
    predicted_pct: float | None
    margin_sessions: int | None
    note: str
    courses: list[AttendanceCourseDetail]


class ExamSubjectReadiness(BaseModel):
    course_id: UUID
    course_code: str
    course_name: str
    readiness_pct: int
    exam_name: str | None = None
    exam_date: date | None = None
    days_until_exam: int | None = None


class ExamPrepResponse(BaseModel):
    overall_readiness: int
    headline: str
    tip: str
    subjects: list[ExamSubjectReadiness]


class CareerOpportunity(BaseModel):
    title: str
    subtitle: str
    icon: str = "briefcase"


class CareerProfileResponse(BaseModel):
    readiness_score: int
    skills: list[str]
    opportunities: list[CareerOpportunity]
    credits_completed: int
    credits_required: int
    narrative: str


class StudentNotificationResponse(BaseModel):
    id: UUID
    title: str
    body: str | None
    tone: str
    created_at: datetime
    read_at: datetime | None
    time_label: str


class StudentActivityResponse(BaseModel):
    id: UUID
    activity_type: str
    summary: str
    created_at: datetime
    time_label: str


class CampusAnnouncementResponse(BaseModel):
    id: UUID
    title: str
    body: str | None
    location: str | None
    published_at: datetime
    closes_at: datetime | None
    time_label: str


class KpiItem(BaseModel):
    id: str
    label: str
    value: str
    sub: str | None = None
    delta: str | None = None
    delta_dir: str | None = None  # up | down
    value_class: str | None = None


class HealthFactor(BaseModel):
    label: str
    value: int
    weight_pct: int


class CoachItem(BaseModel):
    title: str
    why: str
    cta: str
    coach_key: str


class GrowthStat(BaseModel):
    value: str
    label: str
    icon: str


class DailyBriefResponse(BaseModel):
    text: str
    bullets: list[str]


class SemesterTrendItem(BaseModel):
    label: str
    value_pct: float


class SubjectHealthItem(BaseModel):
    course_code: str
    course_name: str
    status: str  # strong | healthy | watch
    tier: str  # low | watch | high — internal mapping only


class StudentDashboardResponse(BaseModel):
    student_id: UUID
    name: str
    first_name: str
    programme_name: str | None
    semester_label: str
    session_label: str
    day_summary: str
    health_score: int
    health_label: str  # On track | Needs attention | Building momentum
    health_factors: list[HealthFactor]
    health_narrative: str
    needs_attention: bool
    attention_banner: dict[str, str] | None = None
    kpis: list[KpiItem]
    daily_brief: DailyBriefResponse
    coach_items: list[CoachItem]
    growth_stats: list[GrowthStat]
    semester_trend: list[SemesterTrendItem]
    subject_health: list[SubjectHealthItem]
    cgpa: float | None
    study_streak_days: int
    on_time_submissions: int
