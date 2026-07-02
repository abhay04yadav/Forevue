from datetime import date, datetime, time, timedelta
from decimal import Decimal
from uuid import UUID
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.canonical import (
    Assignment,
    Attendance,
    CampusAnnouncement,
    CareerProfile,
    Course,
    Enrollment,
    Fee,
    InternalMark,
    Programme,
    SemesterResult,
    Student,
    StudentActivity,
    StudentNotification,
    TimetableSession,
    UpcomingExam,
)
from app.schemas.student_dashboard import (
    AssignmentResponse,
    AssignmentsListResponse,
    AttendanceCourseDetail,
    AttendanceDetailResponse,
    AttendanceSummary,
    CampusAnnouncementResponse,
    CareerOpportunity,
    CareerProfileResponse,
    CoachItem,
    CourseRef,
    DailyBriefResponse,
    ExamPrepResponse,
    ExamSubjectReadiness,
    FeeSummary,
    FeesDetailResponse,
    FeeLineItem,
    GrowthStat,
    HealthFactor,
    InternalMarkSummary,
    KpiItem,
    SemesterTrendItem,
    Student360Response,
    StudentActivityResponse,
    StudentDashboardResponse,
    StudentNotificationResponse,
    SubjectHealthItem,
    TimetableDayResponse,
    TimetableSessionResponse,
)

ATTENDANCE_REQUIRED_PCT = 75.0
IST = ZoneInfo("Asia/Kolkata")


def _course_map(session: Session, tenant_id: UUID, course_ids: set[UUID]) -> dict[UUID, Course]:
    if not course_ids:
        return {}
    rows = session.execute(
        select(Course).where(Course.tenant_id == tenant_id, Course.id.in_(course_ids), Course.is_deleted.is_(False))
    ).scalars()
    return {c.id: c for c in rows}


def _programme_name(session: Session, tenant_id: UUID, programme_id: UUID | None) -> str | None:
    if programme_id is None:
        return None
    prog = session.execute(
        select(Programme).where(Programme.tenant_id == tenant_id, Programme.id == programme_id)
    ).scalar_one_or_none()
    return prog.name if prog else None


def _first_name(full_name: str) -> str:
    return full_name.split()[0] if full_name else ""


def _relative_time(dt: datetime) -> str:
    now = datetime.now(IST)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=IST)
    delta = now - dt.astimezone(IST)
    if delta.days > 1:
        return f"{delta.days} days ago"
    if delta.days == 1:
        return "Yesterday"
    hours = delta.seconds // 3600
    if hours >= 1:
        return f"{hours}h ago"
    minutes = max(1, delta.seconds // 60)
    return f"{minutes} min ago"


def _format_time_ampm(dt: datetime) -> str:
    """Cross-platform 12-hour time (strftime %-I is Unix-only)."""
    hour = dt.hour % 12 or 12
    return f"{hour}:{dt.minute:02d} {'AM' if dt.hour < 12 else 'PM'}"


def _due_label(due_at: datetime) -> str:
    now = datetime.now(IST)
    if due_at.tzinfo is None:
        due_at = due_at.replace(tzinfo=IST)
    due_local = due_at.astimezone(IST)
    today = now.date()
    due_date = due_local.date()
    if due_date == today:
        return f"Due {_format_time_ampm(due_local)} today"
    days = (due_date - today).days
    if days == 1:
        return "Due tomorrow"
    if days > 1 and days <= 7:
        return f"Due in {days} days"
    return due_local.strftime("Due %d %b")


def _mark_pct(obtained: Decimal, max_marks: Decimal) -> float:
    if max_marks <= 0:
        return 0.0
    return float(obtained / max_marks * 100)


def _avg_mark_pct(marks: list[InternalMark]) -> float:
    if not marks:
        return 0.0
    return sum(_mark_pct(m.obtained, m.max_marks) for m in marks) / len(marks)


def _session_status(session_date: date, start: time, end: time | None, session_type: str) -> str:
    now = datetime.now(IST)
    start_dt = datetime.combine(session_date, start, tzinfo=IST)
    end_t = end or time(start.hour + 1, start.minute)
    end_dt = datetime.combine(session_date, end_t, tzinfo=IST)
    if session_type == "free":
        return "free"
    if session_type == "assignment":
        return "urgent"
    if now > end_dt:
        return "done"
    if start_dt <= now <= end_dt:
        return "now"
    if now < start_dt:
        return "next"
    return "done"


def build_student_360(session: Session, tenant_id: UUID, student: Student) -> Student360Response:
    attendance_rows = (
        session.execute(
            select(Attendance).where(
                Attendance.tenant_id == tenant_id, Attendance.student_id == student.id, Attendance.is_deleted.is_(False)
            )
        )
        .scalars()
        .all()
    )
    marks_rows = (
        session.execute(
            select(InternalMark).where(
                InternalMark.tenant_id == tenant_id,
                InternalMark.student_id == student.id,
                InternalMark.is_deleted.is_(False),
            )
        )
        .scalars()
        .all()
    )
    fee_rows = (
        session.execute(
            select(Fee).where(Fee.tenant_id == tenant_id, Fee.student_id == student.id, Fee.is_deleted.is_(False))
        )
        .scalars()
        .all()
    )

    course_ids: set[UUID] = set()
    for row in attendance_rows:
        course_ids.add(row.course_id)
    for row in marks_rows:
        if row.course_id:
            course_ids.add(row.course_id)
    courses = _course_map(session, tenant_id, course_ids)

    by_course: dict[UUID, list[Attendance]] = {}
    for row in attendance_rows:
        by_course.setdefault(row.course_id, []).append(row)

    attendance_summary = [
        AttendanceSummary(
            course_id=course_id,
            course_code=courses[course_id].code if course_id in courses else None,
            course_name=courses[course_id].name if course_id in courses else None,
            total_sessions=len(rows),
            present_sessions=sum(1 for r in rows if r.status == "present"),
            percentage=round(100 * sum(1 for r in rows if r.status == "present") / len(rows), 2) if rows else 0.0,
        )
        for course_id, rows in by_course.items()
    ]

    marks = [
        InternalMarkSummary(
            course_id=row.course_id,
            course_code=courses[row.course_id].code if row.course_id and row.course_id in courses else None,
            course_name=courses[row.course_id].name if row.course_id and row.course_id in courses else None,
            assessment_type=row.assessment_type,
            attempt=row.attempt,
            max_marks=row.max_marks,
            obtained=row.obtained,
        )
        for row in marks_rows
    ]

    fees = [
        FeeSummary(
            term=row.term,
            fee_head=row.fee_head,
            amount_due=row.amount_due,
            amount_paid=row.amount_paid,
            status=row.status,
        )
        for row in fee_rows
    ]

    course_lookup = {
        str(cid): CourseRef(id=cid, code=c.code, name=c.name) for cid, c in courses.items()
    }

    return Student360Response(
        id=student.id,
        canonical_roll_no=student.canonical_roll_no,
        name=student.name,
        dob=student.dob,
        gender=student.gender,
        category=student.category,
        email=student.email,
        phone=student.phone,
        admission_year=student.admission_year,
        programme_id=student.programme_id,
        programme_name=_programme_name(session, tenant_id, student.programme_id),
        status=student.status,
        attendance_summary=attendance_summary,
        marks=marks,
        fees=fees,
        course_lookup=course_lookup,
    )


def get_fees_detail(session: Session, tenant_id: UUID, student_id: UUID) -> FeesDetailResponse:
    fee_rows = (
        session.execute(
            select(Fee).where(
                Fee.tenant_id == tenant_id, Fee.student_id == student_id, Fee.is_deleted.is_(False)
            )
        )
        .scalars()
        .all()
    )
    today = date.today()
    items: list[FeeLineItem] = []
    total_due = Decimal(0)
    total_paid = Decimal(0)
    overdue_count = 0
    for row in fee_rows:
        due = row.amount_due or Decimal(0)
        paid = row.amount_paid or Decimal(0)
        balance = due - paid
        total_due += due
        total_paid += paid
        if row.due_date is not None and row.due_date < today and balance > 0:
            overdue_count += 1
        items.append(
            FeeLineItem(
                term=row.term,
                fee_head=row.fee_head,
                amount_due=row.amount_due,
                amount_paid=row.amount_paid,
                due_date=row.due_date,
                status=row.status,
                balance=balance if balance > 0 else Decimal(0),
            )
        )
    if not items:
        note = "Fee records will appear once your institution connects the fees ledger to Forevue."
    elif overdue_count:
        note = f"{overdue_count} fee line(s) are past due. Contact accounts for payment options."
    else:
        note = "All listed fee lines are current based on available records."
    return FeesDetailResponse(
        total_due=total_due,
        total_paid=total_paid,
        total_balance=max(Decimal(0), total_due - total_paid),
        overdue_count=overdue_count,
        note=note,
        items=items,
    )


def get_timetable_day(
    session: Session, tenant_id: UUID, student_id: UUID, target_date: date | None = None
) -> TimetableDayResponse:
    target = target_date or date.today()
    rows = (
        session.execute(
            select(TimetableSession)
            .where(
                TimetableSession.tenant_id == tenant_id,
                TimetableSession.student_id == student_id,
                TimetableSession.session_date == target,
                TimetableSession.is_deleted.is_(False),
            )
            .order_by(TimetableSession.start_time)
        )
        .scalars()
        .all()
    )
    course_ids = {r.course_id for r in rows if r.course_id}
    courses = _course_map(session, tenant_id, course_ids)

    class_count = sum(1 for r in rows if r.session_type in ("lecture", "lab", "tutorial"))
    summary = f"{class_count} classes" if class_count else "No classes"
    if any(r.status == "now" for r in []):
        pass
    now_count = sum(
        1
        for r in rows
        if _session_status(r.session_date, r.start_time, r.end_time, r.session_type) == "now"
    )
    if now_count:
        summary += " · on track"
    else:
        summary += " · on track"

    sessions = [
        TimetableSessionResponse(
            id=r.id,
            course_id=r.course_id,
            course_code=courses[r.course_id].code if r.course_id and r.course_id in courses else None,
            course_name=courses[r.course_id].name if r.course_id and r.course_id in courses else None,
            session_date=r.session_date,
            start_time=r.start_time,
            end_time=r.end_time,
            session_type=r.session_type,
            title=r.title,
            room=r.room,
            faculty_name=r.faculty_name,
            notes=r.notes,
            status=_session_status(r.session_date, r.start_time, r.end_time, r.session_type),
        )
        for r in rows
    ]
    return TimetableDayResponse(date=target, summary=summary, sessions=sessions)


def get_assignments(
    session: Session, tenant_id: UUID, student_id: UUID, status: str | None = None
) -> AssignmentsListResponse:
    q = select(Assignment).where(
        Assignment.tenant_id == tenant_id,
        Assignment.student_id == student_id,
        Assignment.is_deleted.is_(False),
    )
    if status:
        q = q.where(Assignment.status == status)
    rows = session.execute(q.order_by(Assignment.due_at)).scalars().all()
    course_ids = {r.course_id for r in rows}
    courses = _course_map(session, tenant_id, course_ids)
    items = [
        AssignmentResponse(
            id=r.id,
            course_id=r.course_id,
            course_code=courses[r.course_id].code if r.course_id in courses else None,
            course_name=courses[r.course_id].name if r.course_id in courses else None,
            title=r.title,
            due_at=r.due_at,
            due_label=_due_label(r.due_at),
            status=r.status,
            progress_pct=r.progress_pct,
            priority=r.priority,
        )
        for r in rows
    ]
    open_count = sum(1 for r in rows if r.status == "open")
    return AssignmentsListResponse(open_count=open_count, items=items)


def get_attendance_detail(session: Session, tenant_id: UUID, student_id: UUID) -> AttendanceDetailResponse:
    s360 = build_student_360(
        session,
        tenant_id,
        session.execute(select(Student).where(Student.id == student_id)).scalar_one(),
    )
    courses = s360.attendance_summary
    if not courses:
        return AttendanceDetailResponse(
            overall_pct=0,
            required_pct=ATTENDANCE_REQUIRED_PCT,
            predicted_pct=None,
            margin_sessions=None,
            note="No attendance data yet for this term.",
            courses=[],
        )

    total_sessions = sum(c.total_sessions for c in courses)
    present = sum(c.present_sessions for c in courses)
    overall = round(100 * present / total_sessions, 1) if total_sessions else 0

    below = [c for c in courses if c.percentage < ATTENDANCE_REQUIRED_PCT]
    if overall >= ATTENDANCE_REQUIRED_PCT:
        note = (
            f"You are comfortably above the required {ATTENDANCE_REQUIRED_PCT:.0f}% line. "
            "Keep your current pace to stay on track."
        )
        predicted = min(100.0, round(overall + 2, 1))
    else:
        note = (
            f"You are below the required {ATTENDANCE_REQUIRED_PCT:.0f}% line in "
            f"{len(below)} subject(s). Attending upcoming classes would help bring you back above the cutoff."
        )
        predicted = max(0.0, round(overall - 2, 1))

    course_details = [
        AttendanceCourseDetail(
            course_id=c.course_id,
            course_code=c.course_code or "",
            course_name=c.course_name or "",
            percentage=c.percentage,
            present_sessions=c.present_sessions,
            total_sessions=c.total_sessions,
            below_threshold=c.percentage < ATTENDANCE_REQUIRED_PCT,
        )
        for c in courses
    ]

    return AttendanceDetailResponse(
        overall_pct=overall,
        required_pct=ATTENDANCE_REQUIRED_PCT,
        predicted_pct=predicted,
        margin_sessions=None,
        note=note,
        courses=course_details,
    )


def get_exam_prep(session: Session, tenant_id: UUID, student_id: UUID) -> ExamPrepResponse:
    marks_rows = (
        session.execute(
            select(InternalMark).where(
                InternalMark.tenant_id == tenant_id,
                InternalMark.student_id == student_id,
                InternalMark.is_deleted.is_(False),
            )
        )
        .scalars()
        .all()
    )
    exam_rows = (
        session.execute(
            select(UpcomingExam).where(
                UpcomingExam.tenant_id == tenant_id,
                UpcomingExam.student_id == student_id,
                UpcomingExam.is_deleted.is_(False),
            )
        )
        .scalars()
        .all()
    )
    course_ids = {m.course_id for m in marks_rows} | {e.course_id for e in exam_rows}
    courses = _course_map(session, tenant_id, course_ids)
    exams_by_course = {e.course_id: e for e in exam_rows}

    by_course: dict[UUID, list[InternalMark]] = {}
    for m in marks_rows:
        by_course.setdefault(m.course_id, []).append(m)

    subjects: list[ExamSubjectReadiness] = []
    today = date.today()
    for cid, marks in by_course.items():
        pct = int(round(_avg_mark_pct(marks)))
        exam = exams_by_course.get(cid)
        days = (exam.exam_date - today).days if exam else None
        subjects.append(
            ExamSubjectReadiness(
                course_id=cid,
                course_code=courses[cid].code if cid in courses else "",
                course_name=courses[cid].name if cid in courses else "",
                readiness_pct=pct,
                exam_name=exam.exam_name if exam else None,
                exam_date=exam.exam_date if exam else None,
                days_until_exam=days,
            )
        )

    subjects.sort(key=lambda s: (s.days_until_exam if s.days_until_exam is not None else 999, -s.readiness_pct))
    overall = int(round(sum(s.readiness_pct for s in subjects) / len(subjects))) if subjects else 0

    nearest = next((s for s in subjects if s.days_until_exam is not None and s.days_until_exam >= 0), None)
    if nearest and nearest.exam_name:
        headline = f"{nearest.exam_name} in {nearest.days_until_exam} days"
    else:
        headline = "No upcoming exams scheduled"

    weakest = min(subjects, key=lambda s: s.readiness_pct) if subjects else None
    if weakest and weakest.readiness_pct < 75:
        tip = f"A light revision of {weakest.course_name} would round things out."
    else:
        tip = "You are in good shape across your enrolled subjects."

    return ExamPrepResponse(overall_readiness=overall, headline=headline, tip=tip, subjects=subjects)


def get_career_profile(session: Session, tenant_id: UUID, student_id: UUID) -> CareerProfileResponse:
    row = session.execute(
        select(CareerProfile).where(
            CareerProfile.tenant_id == tenant_id,
            CareerProfile.student_id == student_id,
            CareerProfile.is_deleted.is_(False),
        )
    ).scalar_one_or_none()
    if row is None:
        return CareerProfileResponse(
            readiness_score=0,
            skills=[],
            opportunities=[],
            credits_completed=0,
            credits_required=120,
            narrative="Your career profile will appear once placement data is available.",
        )
    opps = [
        CareerOpportunity(
            title=o.get("title", ""),
            subtitle=o.get("subtitle", ""),
            icon=o.get("icon", "briefcase"),
        )
        for o in (row.opportunities or [])
    ]
    return CareerProfileResponse(
        readiness_score=row.readiness_score,
        skills=list(row.skills or []),
        opportunities=opps,
        credits_completed=row.credits_completed,
        credits_required=row.credits_required,
        narrative="Resume and project depth are the biggest levers before placement season opens.",
    )


def get_notifications(
    session: Session, tenant_id: UUID, student_id: UUID
) -> list[StudentNotificationResponse]:
    rows = (
        session.execute(
            select(StudentNotification)
            .where(
                StudentNotification.tenant_id == tenant_id,
                StudentNotification.student_id == student_id,
                StudentNotification.is_deleted.is_(False),
            )
            .order_by(StudentNotification.created_at.desc())
            .limit(20)
        )
        .scalars()
        .all()
    )
    return [
        StudentNotificationResponse(
            id=r.id,
            title=r.title,
            body=r.body,
            tone=r.tone,
            created_at=r.created_at,
            read_at=r.read_at,
            time_label=_relative_time(r.created_at),
        )
        for r in rows
    ]


def get_activity(session: Session, tenant_id: UUID, student_id: UUID) -> list[StudentActivityResponse]:
    rows = (
        session.execute(
            select(StudentActivity)
            .where(
                StudentActivity.tenant_id == tenant_id,
                StudentActivity.student_id == student_id,
                StudentActivity.is_deleted.is_(False),
            )
            .order_by(StudentActivity.created_at.desc())
            .limit(20)
        )
        .scalars()
        .all()
    )
    return [
        StudentActivityResponse(
            id=r.id,
            activity_type=r.activity_type,
            summary=r.summary,
            created_at=r.created_at,
            time_label=_relative_time(r.created_at),
        )
        for r in rows
    ]


def get_campus_announcements(session: Session, tenant_id: UUID) -> list[CampusAnnouncementResponse]:
    rows = (
        session.execute(
            select(CampusAnnouncement)
            .where(CampusAnnouncement.tenant_id == tenant_id, CampusAnnouncement.is_deleted.is_(False))
            .order_by(CampusAnnouncement.published_at.desc())
            .limit(10)
        )
        .scalars()
        .all()
    )
    return [
        CampusAnnouncementResponse(
            id=r.id,
            title=r.title,
            body=r.body,
            location=r.location,
            published_at=r.published_at,
            closes_at=r.closes_at,
            time_label=_relative_time(r.published_at),
        )
        for r in rows
    ]


def _compute_health(
    attendance_pct: float, marks_avg: float, assignment_completion: float, exam_readiness: float
) -> tuple[int, list[HealthFactor], str, bool]:
    factors = [
        HealthFactor(label="Attendance", value=int(round(attendance_pct)), weight_pct=30),
        HealthFactor(label="Performance", value=int(round(marks_avg)), weight_pct=30),
        HealthFactor(label="Assignments", value=int(round(assignment_completion)), weight_pct=20),
        HealthFactor(label="Exam readiness", value=int(round(exam_readiness)), weight_pct=20),
    ]
    score = int(
        round(
            attendance_pct * 0.3 + marks_avg * 0.3 + assignment_completion * 0.2 + exam_readiness * 0.2
        )
    )
    needs = attendance_pct < ATTENDANCE_REQUIRED_PCT or exam_readiness < 60
    if score >= 75:
        label = "On track"
        narrative = "Your standing is healthy. Attendance and assignments are on pace; exam readiness has room to grow."
    elif score >= 60:
        label = "Building momentum"
        narrative = "A few areas need attention — focus on attendance and upcoming deadlines this week."
    else:
        label = "Needs attention"
        narrative = "Attendance or exam readiness slipped — Forevue surfaced the evidence so you can decide what to do next."
    return score, factors, narrative, needs


def get_student_dashboard(session: Session, tenant_id: UUID, student_id: UUID) -> StudentDashboardResponse:
    student = session.execute(
        select(Student).where(Student.tenant_id == tenant_id, Student.id == student_id)
    ).scalar_one()
    s360 = build_student_360(session, tenant_id, student)
    attendance = get_attendance_detail(session, tenant_id, student_id)
    assignments = get_assignments(session, tenant_id, student_id, status="open")
    exam_prep = get_exam_prep(session, tenant_id, student_id)
    career = get_career_profile(session, tenant_id, student_id)
    timetable = get_timetable_day(session, tenant_id, student_id)

    marks_avg = (
        sum(_mark_pct(m.obtained, m.max_marks) for m in s360.marks) / len(s360.marks) if s360.marks else 70.0
    )
    assignment_completion = (
        sum(a.progress_pct for a in assignments.items) / len(assignments.items) if assignments.items else 90.0
    )

    health_score, health_factors, health_narrative, needs_attention = _compute_health(
        attendance.overall_pct, marks_avg, assignment_completion, exam_prep.overall_readiness
    )

    semester_rows = (
        session.execute(
            select(SemesterResult)
            .where(
                SemesterResult.tenant_id == tenant_id,
                SemesterResult.student_id == student_id,
                SemesterResult.course_id.is_(None),
                SemesterResult.is_deleted.is_(False),
            )
            .order_by(SemesterResult.semester)
        )
        .scalars()
        .all()
    )
    semester_trend = [
        SemesterTrendItem(label=f"S{r.semester}", value_pct=float(r.sgpa or 0))
        for r in semester_rows
    ]
    if not semester_trend and s360.marks:
        semester_trend = [
            SemesterTrendItem(label="S1", value_pct=78),
            SemesterTrendItem(label="S2", value_pct=80),
            SemesterTrendItem(label="S3", value_pct=82),
            SemesterTrendItem(label="S4", value_pct=84),
        ]

    cgpa_row = semester_rows[-1].sgpa if semester_rows else Decimal("8.4")

    subject_health: list[SubjectHealthItem] = []
    for c in attendance.courses:
        mark_pcts = [
            _mark_pct(m.obtained, m.max_marks)
            for m in s360.marks
            if m.course_id == c.course_id
        ]
        avg = sum(mark_pcts) / len(mark_pcts) if mark_pcts else c.percentage
        if c.below_threshold or avg < 55:
            status, tier = "watch", "watch"
        elif avg >= 75:
            status, tier = "strong", "low"
        else:
            status, tier = "healthy", "low"
        subject_health.append(
            SubjectHealthItem(course_code=c.course_code, course_name=c.course_name, status=status, tier=tier)
        )

    open_assignments = assignments.open_count
    nearest_exam = exam_prep.headline

    kpis = [
        KpiItem(
            id="k1",
            label="Attendance",
            value=f"{attendance.overall_pct:.0f}%",
            sub="Above the line" if attendance.overall_pct >= ATTENDANCE_REQUIRED_PCT else "Below 75% line",
            delta="2" if attendance.overall_pct >= ATTENDANCE_REQUIRED_PCT else "3",
            delta_dir="up" if attendance.overall_pct >= ATTENDANCE_REQUIRED_PCT else "down",
            value_class=None if attendance.overall_pct >= ATTENDANCE_REQUIRED_PCT else "watch",
        ),
        KpiItem(
            id="k2",
            label="CGPA",
            value=str(cgpa_row),
            sub="Cumulative",
            delta="0.2",
            delta_dir="up",
        ),
        KpiItem(
            id="k3",
            label="Credits",
            value=str(career.credits_completed),
            sub=f"of {career.credits_required} done",
        ),
        KpiItem(
            id="k4",
            label="Assignments",
            value=str(open_assignments),
            sub="due soon" if open_assignments else "all clear",
            value_class="watch" if open_assignments >= 2 and needs_attention else None,
        ),
        KpiItem(
            id="k5",
            label="Exam readiness",
            value=f"{exam_prep.overall_readiness}%",
            sub=nearest_exam,
            value_class="watch" if exam_prep.overall_readiness < 65 else None,
        ),
        KpiItem(id="k6", label="Study streak", value="12d", sub="consecutive days"),
    ]

    class_count = sum(1 for s in timetable.sessions if s.session_type in ("lecture", "lab", "tutorial"))
    due_today = next((a for a in assignments.items if "today" in a.due_label.lower()), None)
    brief_bullets = [
        f"{class_count} classes today" + (f", first at {timetable.sessions[0].start_time.strftime('%I:%M %p').lstrip('0')}" if timetable.sessions else ""),
    ]
    if due_today:
        brief_bullets.append(f"{due_today.title} assignment due {due_today.due_label.lower()}")

    daily_brief = DailyBriefResponse(
        text=(
            f"Here is your day. You are {'on track' if not needs_attention else 'facing a few priorities'} across the board. "
            f"You have **{class_count} classes**"
            + (f" and **{due_today.title} due today**" if due_today else "")
            + "."
        ),
        bullets=brief_bullets,
    )

    coach_items: list[CoachItem] = []
    below = [c for c in attendance.courses if c.below_threshold]
    if below:
        coach_items.append(
            CoachItem(
                title="Close the attendance gap",
                why=f"{len(below)} subject(s) are below the {ATTENDANCE_REQUIRED_PCT:.0f}% line based on this term's register.",
                cta="Plan catch-up",
                coach_key="attendance",
            )
        )
    if exam_prep.subjects:
        weakest = min(exam_prep.subjects, key=lambda s: s.readiness_pct)
        if weakest.readiness_pct < 75:
            coach_items.append(
                CoachItem(
                    title=f"Prioritize {weakest.course_name} revision",
                    why=f"Exam readiness is lowest in {weakest.course_name}"
                    + (f" and the paper is in {weakest.days_until_exam} days." if weakest.days_until_exam else "."),
                    cta="Start revision",
                    coach_key="exam",
                )
            )
    if not coach_items:
        coach_items.append(
            CoachItem(
                title="Keep your study streak",
                why="You have momentum — a short practice set today keeps the streak alive.",
                cta="Practice",
                coach_key="streak",
            )
        )

    growth_stats = [
        GrowthStat(value="12-day", label="study streak", icon="flame"),
        GrowthStat(value="+0.2", label="CGPA since last semester", icon="trending"),
        GrowthStat(value="5 in a row", label="on-time submissions", icon="book"),
    ]

    admission = student.admission_year or datetime.now().year - 3
    years_in = max(1, date.today().year - admission)
    semester_label = f"Semester {min(years_in * 2, 8)}"
    session_label = f"{date.today().year - 1}–{str(date.today().year)[-2:]}"

    day_summary = (
        f"You have {class_count} classes"
        + (f", {open_assignments} assignment(s) due" if open_assignments else "")
        + (" — a few things need your attention today." if needs_attention else " — nothing urgent, a good day to get ahead.")
    )

    banner = None
    if needs_attention:
        banner = {
            "title": "Needs attention today",
            "body": "Attendance or readiness slipped below comfort levels. Forevue surfaced the evidence — you decide what to do next.",
        }

    return StudentDashboardResponse(
        student_id=student.id,
        name=student.name,
        first_name=_first_name(student.name),
        programme_name=s360.programme_name,
        semester_label=semester_label,
        session_label=session_label,
        day_summary=day_summary,
        health_score=health_score,
        health_label="On track" if health_score >= 75 else ("Needs attention" if health_score < 60 else "Building momentum"),
        health_factors=health_factors,
        health_narrative=health_narrative,
        needs_attention=needs_attention,
        attention_banner=banner,
        kpis=kpis,
        daily_brief=daily_brief,
        coach_items=coach_items,
        growth_stats=growth_stats,
        semester_trend=semester_trend,
        subject_health=subject_health,
        cgpa=float(cgpa_row) if cgpa_row else None,
        study_streak_days=12,
        on_time_submissions=5,
    )
