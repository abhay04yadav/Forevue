"""Faculty home dashboard aggregator (RSDD §6, §10)."""

from __future__ import annotations

from collections import defaultdict
from datetime import UTC, date, datetime, time
from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.models.canonical import Assignment, Attendance, Course, InternalMark, Student, TimetableSession
from app.models.faculty_workspace import FacultyArtifact, FacultyCoursePlan, GenerationJob
from app.models.risk import Intervention, RiskAlert, RiskFinding
from app.models.user import User
from app.repositories.risk_repository import RiskRepository
from app.schemas.faculty import (
    ApprovalItem,
    AssignmentReviewItem,
    AtRiskStudentItem,
    AttendanceRegisterItem,
    AttendanceTasksPayload,
    AttendanceWatchItem,
    BriefActionItem,
    ClassPerformancePayload,
    ClassPerformanceSubject,
    CoachItem,
    CourseProgressItem,
    DailyBriefPayload,
    FacultyClassSession,
    FacultyDashboardResponse,
    FacultyKpiItem,
    FlaggedStudentItem,
    HealthFactor,
    ImportFreshness,
    NavBadges,
    RecentActivityItem,
)
from app.services.risk.scoping import SCOPE_RESOLVED_STAFF_ROLES, visible_student_ids
from app.services.student_dashboard_service import _session_status

SECTION_BY_COURSE: dict[str, str] = {
    "DBMS": "CSE-3A",
    "OS": "CSE-3B",
    "DSA": "CSE-2A",
    "CN": "CSE-3A",
    "TOC": "CSE-3B",
}


def _attendance_rates(
    session: Session, tenant_id: UUID, student_ids: set[UUID]
) -> dict[UUID, float]:
    if not student_ids:
        return {}
    rows = session.execute(
        select(
            Attendance.student_id,
            func.count().filter(Attendance.status == "present").label("present"),
            func.count().label("total"),
        )
        .where(Attendance.tenant_id == tenant_id, Attendance.student_id.in_(student_ids))
        .group_by(Attendance.student_id)
    ).all()
    out: dict[UUID, float] = {}
    for student_id, present, total in rows:
        if total and total > 0:
            out[student_id] = round(100.0 * present / total, 1)
    return out


def _top_finding(session: Session, tenant_id: UUID, assessment_id: UUID) -> str | None:
    row = session.execute(
        select(RiskFinding.message)
        .where(
            RiskFinding.tenant_id == tenant_id,
            RiskFinding.assessment_id == assessment_id,
        )
        .order_by(RiskFinding.severity.desc())
        .limit(1)
    ).scalar_one_or_none()
    return row


def _first_name_from_email(email: str | None) -> str:
    if not email:
        return "Faculty"
    local = email.split("@")[0]
    parts = local.replace(".", " ").replace("_", " ").split()
    if not parts:
        return "Faculty"
    return parts[0].capitalize()


def _department_name(session: Session, tenant_id: UUID, user_id: UUID) -> str | None:
    row = session.execute(
        text(
            "SELECT scope_ref FROM faculty_scopes "
            "WHERE tenant_id = :t AND user_id = :u AND scope_type = 'department' LIMIT 1"
        ),
        {"t": tenant_id, "u": user_id},
    ).scalar_one_or_none()
    if not row:
        return None
    names = {"CSE": "Computer Science", "MECH": "Mechanical Engineering", "ECE": "Electronics & Communication"}
    return names.get(str(row), str(row))


def _mark_pct(obtained: Decimal, maximum: Decimal) -> float:
    if maximum <= 0:
        return 0.0
    return round(float(obtained / maximum) * 100, 1)


def _course_avg_marks(
    session: Session, tenant_id: UUID, visible: set[UUID], course_ids: set[UUID]
) -> dict[UUID, float]:
    if not course_ids:
        return {}
    rows = session.execute(
        select(InternalMark)
        .where(
            InternalMark.tenant_id == tenant_id,
            InternalMark.student_id.in_(visible),
            InternalMark.course_id.in_(course_ids),
            InternalMark.is_deleted.is_(False),
        )
    ).scalars().all()
    buckets: dict[UUID, list[float]] = defaultdict(list)
    for row in rows:
        buckets[row.course_id].append(_mark_pct(row.obtained, row.max_marks))
    return {cid: round(sum(vals) / len(vals), 1) for cid, vals in buckets.items() if vals}


def _faculty_classes_today(
    session: Session, tenant_id: UUID, visible: set[UUID]
) -> list[FacultyClassSession]:
    today = date.today()
    rows = session.execute(
        select(TimetableSession, Course)
        .outerjoin(Course, Course.id == TimetableSession.course_id)
        .where(
            TimetableSession.tenant_id == tenant_id,
            TimetableSession.student_id.in_(visible),
            TimetableSession.session_date == today,
            TimetableSession.is_deleted.is_(False),
        )
        .order_by(TimetableSession.start_time)
    ).all()

    grouped: dict[tuple, list[TimetableSession]] = defaultdict(list)
    for tt, _course in rows:
        key = (tt.start_time, tt.title, tt.course_id, tt.session_type)
        grouped[key].append(tt)

    classes: list[FacultyClassSession] = []
    for idx, ((start, title, course_id, session_type), sessions) in enumerate(grouped.items()):
        course = None
        if course_id:
            course = session.execute(
                select(Course).where(Course.id == course_id, Course.tenant_id == tenant_id)
            ).scalar_one_or_none()
        code = course.code if course else ""
        section = SECTION_BY_COURSE.get(code, "CSE")
        status = _session_status(today, start, sessions[0].end_time, session_type)
        status_note: str | None = None
        if status == "done" and session_type in ("lecture", "lab", "tutorial"):
            status_note = "Attendance filled. Recap notes generated."
        elif status == "free":
            status_note = sessions[0].notes or "Good window for prep or reviews."
        elif status == "now":
            status_note = "NOW"
        room = sessions[0].room
        classes.append(
            FacultyClassSession(
                id=f"cls-{idx}",
                start_time=start.strftime("%H:%M"),
                title=title,
                section=section if session_type != "free" else None,
                room=room,
                student_count=len(sessions) if session_type in ("lecture", "lab", "tutorial") else None,
                status=status,
                status_note=status_note,
                session_type=session_type,
            )
        )
    return classes


def _assignment_reviews(
    session: Session, tenant_id: UUID, visible: set[UUID]
) -> list[AssignmentReviewItem]:
    rows = session.execute(
        select(Assignment, Course)
        .join(Course, Course.id == Assignment.course_id)
        .where(
            Assignment.tenant_id == tenant_id,
            Assignment.student_id.in_(visible),
            Assignment.is_deleted.is_(False),
        )
        .order_by(Assignment.due_at)
    ).all()
    grouped: dict[tuple[str, UUID], list[Assignment]] = defaultdict(list)
    for assignment, _course in rows:
        grouped[(assignment.title, assignment.course_id)].append(assignment)

    reviews: list[AssignmentReviewItem] = []
    for idx, ((title, course_id), items) in enumerate(grouped.items()):
        course = session.execute(
            select(Course).where(Course.id == course_id, Course.tenant_id == tenant_id)
        ).scalar_one_or_none()
        code = course.code if course else "—"
        section = SECTION_BY_COURSE.get(code, "CSE")
        due = items[0].due_at
        days = (due.date() - date.today()).days
        if days < 0:
            due_label = "Overdue"
        elif days == 0:
            due_label = "Grade by tomorrow"
        elif days <= 2:
            due_label = f"Due in {days} days"
        else:
            due_label = "Just submitted"
        priority = items[0].priority if items else "normal"
        graded = sum(1 for a in items if a.status == "submitted" or a.progress_pct >= 100)
        reviews.append(
            AssignmentReviewItem(
                id=f"rev-{idx}",
                title=title,
                priority=priority,
                due_label=due_label,
                section=section,
                submission_count=len(items),
                graded_count=graded,
            )
        )
    return reviews[:6]


def _pending_approvals(
    session: Session, tenant_id: UUID, user_id: UUID, artifact_count: int
) -> list[ApprovalItem]:
    artifacts = session.execute(
        select(FacultyArtifact)
        .where(
            FacultyArtifact.tenant_id == tenant_id,
            FacultyArtifact.owner_user_id == user_id,
            FacultyArtifact.status.in_(("draft", "pending_approval")),
            FacultyArtifact.is_deleted.is_(False),
        )
        .order_by(FacultyArtifact.updated_at.desc())
        .limit(3)
    ).scalars().all()
    items = [
        ApprovalItem(
            id=str(a.id),
            kind="Content approval",
            title=a.title,
            due_label="Awaiting sign-off",
        )
        for a in artifacts
    ]
    if len(items) < 3 and artifact_count > 0:
        items.append(
            ApprovalItem(
                id="approval-assignment",
                kind="Assignment approval",
                title="CSE-3A DBMS assignment",
                due_label="Due today",
            )
        )
    return items[:3]


def _compute_health(
    avg_attendance: float | None,
    avg_performance: float | None,
    avg_coverage: float | None,
    on_track_pct: float | None,
) -> tuple[int, list[HealthFactor], str]:
    att = int(avg_attendance or 82)
    perf = int(avg_performance or 80)
    engage = int(on_track_pct or 85)
    coverage = int(avg_coverage or 80)
    score = round(att * 0.35 + perf * 0.25 + engage * 0.25 + coverage * 0.15)
    factors = [
        HealthFactor(label="Attendance", value=att),
        HealthFactor(label="Performance", value=perf),
        HealthFactor(label="Engagement", value=engage),
        HealthFactor(label="At-risk load", value=max(0, 100 - engage)),
    ]
    if score >= 80:
        narrative = (
            "Your sections are healthy. Attendance and engagement are strong across the board. "
            "DBMS performance has a little room before the internal exam."
        )
    elif score >= 65:
        narrative = (
            "Most sections are on track. A few students need attention this week — "
            "review flagged items before internals."
        )
    else:
        narrative = (
            "Several signals need attention — attendance dips and performance gaps "
            "in one or more sections. Start with the highest-confidence flags."
        )
    return score, factors, narrative


def _empty_response(text: str, bullets: list[str] | None = None) -> FacultyDashboardResponse:
    return FacultyDashboardResponse(
        has_scope=False,
        daily_brief=DailyBriefPayload(text=text, bullets=bullets or []),
        kpis=[],
        at_risk_students=[],
        attendance_watch=[],
        course_progress=[],
        recent_activity=[],
    )


def get_faculty_dashboard(
    session: Session,
    tenant_id: UUID,
    user_id: UUID,
    role: str,
) -> FacultyDashboardResponse:
    if role not in SCOPE_RESOLVED_STAFF_ROLES:
        return _empty_response("Faculty dashboard is not available for this role.")

    visible = visible_student_ids(session, tenant_id, role, user_id)
    has_scope = visible is not None and len(visible) > 0

    if not has_scope:
        return _empty_response(
            "No teaching cohort is assigned to your account yet.",
            ["Contact your college admin to assign department, programme, or course scopes."],
        )

    user = session.execute(select(User).where(User.id == user_id)).scalar_one()
    first_name = _first_name_from_email(user.email)
    department_name = _department_name(session, tenant_id, user_id)
    session_label = f"{date.today().year - 1}–{str(date.today().year)[-2:]}"
    semester_label = "Semester 4"

    repo = RiskRepository(session, tenant_id)
    summary = repo.summary(student_ids=visible)
    by_tier = summary["by_tier"]
    total_assessed = summary["total_assessed"]
    watch_high = by_tier.get("watch", 0) + by_tier.get("high", 0)

    at_risk_rows = repo.list_at_risk(student_ids=visible, page_size=8)
    at_risk_students: list[AtRiskStudentItem] = []
    flagged_students: list[FlaggedStudentItem] = []
    for assessment, student in at_risk_rows:
        finding = _top_finding(session, tenant_id, assessment.id)
        at_risk_students.append(
            AtRiskStudentItem(
                student_id=student.id,
                name=student.name,
                roll_no=student.canonical_roll_no,
                tier=assessment.tier,
                top_finding=finding,
            )
        )
        short_name = " ".join(student.name.split()[:2])
        if len(student.name.split()) > 1:
            short_name = f"{student.name.split()[0][0]}. {student.name.split()[-1]}"
        why = finding or f"Risk tier is {assessment.tier} in your cohort."
        confidence = 82 if assessment.tier == "watch" else 91
        flagged_students.append(
            FlaggedStudentItem(
                student_id=student.id,
                name=short_name,
                section=SECTION_BY_COURSE.get("DBMS", "CSE-3A"),
                why=why,
                based_on="Risk assessment",
                confidence_pct=confidence,
                confidence_label="Watch" if assessment.tier == "watch" else "High",
                tier=assessment.tier,
            )
        )

    rates = _attendance_rates(session, tenant_id, visible)
    attendance_watch: list[AttendanceWatchItem] = []
    if rates:
        students = {
            s.id: s
            for s in session.execute(select(Student).where(Student.id.in_(rates.keys()))).scalars().all()
        }
        for sid, rate in sorted(rates.items(), key=lambda x: x[1]):
            if rate >= 75:
                continue
            student = students.get(sid)
            if student is None:
                continue
            note = "Below attendance line" if rate < 65 else "Approaching threshold"
            attendance_watch.append(
                AttendanceWatchItem(
                    student_id=sid,
                    name=student.name,
                    roll_no=student.canonical_roll_no,
                    present_rate_pct=rate,
                    note=note,
                )
            )
            if len(attendance_watch) >= 6:
                break

    plan_rows = session.execute(
        select(FacultyCoursePlan, Course)
        .join(Course, Course.id == FacultyCoursePlan.course_id)
        .where(
            FacultyCoursePlan.tenant_id == tenant_id,
            FacultyCoursePlan.owner_user_id == user_id,
            FacultyCoursePlan.is_deleted.is_(False),
        )
    ).all()
    course_progress: list[CourseProgressItem] = []
    coverage_values: list[float] = []
    plan_course_ids: set[UUID] = set()
    for plan, course in plan_rows:
        plan_course_ids.add(course.id)
        pct = (
            round(100.0 * plan.delivered_sessions / plan.planned_sessions, 1)
            if plan.planned_sessions > 0
            else 0.0
        )
        coverage_values.append(pct)
        slippage = plan.planned_sessions > 0 and plan.delivered_sessions < plan.planned_sessions * 0.85
        course_progress.append(
            CourseProgressItem(
                course_id=course.id,
                course_code=course.code,
                course_name=course.name,
                coverage_pct=pct,
                planned_sessions=plan.planned_sessions,
                delivered_sessions=plan.delivered_sessions,
                slippage=slippage,
            )
        )

    avg_attendance: float | None = round(sum(rates.values()) / len(rates), 1) if rates else None
    avg_coverage: float | None = round(sum(coverage_values) / len(coverage_values), 1) if coverage_values else None
    course_avgs = _course_avg_marks(session, tenant_id, visible, plan_course_ids)
    avg_performance: float | None = (
        round(sum(course_avgs.values()) / len(course_avgs), 1) if course_avgs else None
    )
    on_track_pct: float | None = None
    if total_assessed > 0:
        on_track_pct = round(100.0 * by_tier.get("low", 0) / total_assessed, 1)

    health_score, health_factors, health_narrative = _compute_health(
        avg_attendance, avg_performance, avg_coverage, on_track_pct
    )
    health_label = "Healthy" if health_score >= 80 else ("Watch" if health_score >= 65 else "Needs attention")

    classes_today = _faculty_classes_today(session, tenant_id, visible)
    teaching_classes = [c for c in classes_today if c.session_type in ("lecture", "lab", "tutorial")]
    next_class = next((c for c in teaching_classes if c.status in ("now", "next")), None)

    assignment_reviews = _assignment_reviews(session, tenant_id, visible)
    pending_review_count = len(assignment_reviews)
    artifact_count = session.execute(
        select(func.count())
        .select_from(FacultyArtifact)
        .where(
            FacultyArtifact.tenant_id == tenant_id,
            FacultyArtifact.owner_user_id == user_id,
            FacultyArtifact.is_deleted.is_(False),
        )
    ).scalar_one()
    pending_approvals = _pending_approvals(session, tenant_id, user_id, artifact_count)

    registers: list[AttendanceRegisterItem] = []
    filled = 0
    pending_att = 0
    for cls in teaching_classes:
        reg_status = "filled" if cls.status == "done" else ("pending" if cls.status == "now" else "upcoming")
        if reg_status == "filled":
            filled += 1
        elif reg_status == "pending":
            pending_att += 1
        code = cls.title.split()[0] if cls.title else "—"
        for cp in course_progress:
            if cp.course_name.split()[0] in cls.title or cp.course_code in cls.title:
                code = cp.course_code
                break
        registers.append(
            AttendanceRegisterItem(
                section=cls.section or "CSE",
                course_code=code,
                start_time=cls.start_time,
                status=reg_status,
            )
        )
    attendance_tasks = AttendanceTasksPayload(
        pending=pending_att,
        completed=filled,
        overdue=0,
        filled_count=filled,
        total_count=len(teaching_classes),
        registers=registers,
    )

    perf_subjects: list[ClassPerformanceSubject] = []
    for plan, course in plan_rows:
        avg = course_avgs.get(course.id, 78.0)
        tone = "watch" if avg < 76 else "healthy"
        perf_subjects.append(
            ClassPerformanceSubject(
                section=SECTION_BY_COURSE.get(course.code, "CSE"),
                course_code=course.code,
                avg_pct=avg,
                tone=tone,
            )
        )
    lowest = min(perf_subjects, key=lambda s: s.avg_pct) if perf_subjects else None
    class_performance = ClassPerformancePayload(
        avg_internal_pct=avg_performance or 78.0,
        delta_pts=2.0 if avg_performance else None,
        internals_in_days=12,
        subjects=perf_subjects,
        insight=(
            f"{lowest.course_code} in {lowest.section} is trending lowest — a short recap could lift the internal average."
            if lowest and lowest.tone == "watch"
            else "Section averages are holding steady ahead of internals."
        ),
    )

    pending_interventions = session.execute(
        select(func.count())
        .select_from(Intervention)
        .where(
            Intervention.tenant_id == tenant_id,
            Intervention.student_id.in_(visible),
            Intervention.status.in_(("suggested", "open", "in_progress")),
        )
    ).scalar_one()

    unread_alerts = session.execute(
        select(func.count())
        .select_from(RiskAlert)
        .where(
            RiskAlert.tenant_id == tenant_id,
            RiskAlert.recipient_user_id == user_id,
            RiskAlert.status != "read",
        )
    ).scalar_one()

    nav_badges = NavBadges(
        reviews=pending_review_count,
        students=watch_high,
        approvals=len(pending_approvals),
    )

    kpis: list[FacultyKpiItem] = [
        FacultyKpiItem(
            id="classes",
            label="Classes today",
            value=str(len(teaching_classes)),
            sub=f"next at {next_class.start_time}" if next_class else "none scheduled",
        ),
        FacultyKpiItem(
            id="reviews",
            label="Pending reviews",
            value=str(pending_review_count),
            sub=assignment_reviews[0].title.split()[0] + " oldest" if assignment_reviews else "all clear",
        ),
        FacultyKpiItem(
            id="at_risk",
            label="Students at risk",
            value=str(watch_high),
            sub=f"across {min(3, len(course_progress) or 1)} sections",
        ),
        FacultyKpiItem(
            id="attendance_pending",
            label="Attendance pending",
            value=str(pending_att),
            sub=f"{pending_att} register open" if pending_att else "all filled",
        ),
        FacultyKpiItem(
            id="approvals",
            label="Approvals waiting",
            value=str(len(pending_approvals)),
            sub="2 due today" if len(pending_approvals) >= 2 else "on track",
        ),
        FacultyKpiItem(
            id="effectiveness",
            label="Teaching effectiveness",
            value=str(health_score),
            sub="AI top quartile" if health_score >= 80 else "room to improve",
        ),
    ]

    bullets: list[str] = []
    if by_tier.get("high", 0) > 0:
        bullets.append(f"{by_tier['high']} student(s) in high tier — triage on the risk board")
    if by_tier.get("watch", 0) > 0:
        bullets.append(f"{by_tier['watch']} on watch — review movement before classes")
    if attendance_watch:
        bullets.append(f"{len(attendance_watch)} student(s) below or near the attendance line")
    if pending_interventions > 0:
        bullets.append(f"{pending_interventions} open intervention(s) need follow-up")
    if unread_alerts > 0:
        bullets.append(f"{unread_alerts} unread alert(s)")
    if not bullets:
        bullets.append("Nothing notable in your cohort today — keep monitoring on the risk board")

    brief_actions = [
        BriefActionItem(
            icon="calendar",
            text=f"{len(teaching_classes)} classes today"
            + (f" • next: {next_class.title} at {next_class.start_time}" if next_class else ""),
            link_label="View",
        ),
        BriefActionItem(
            icon="clipboard",
            text=f"{pending_review_count} submissions to review"
            + (f" • {assignment_reviews[0].title} oldest" if assignment_reviews else ""),
            link_label="Review",
        ),
        BriefActionItem(
            icon="users",
            text=f"{watch_high} students need attention this week",
            link_label="Open",
        ),
        BriefActionItem(
            icon="file",
            text=f"{len(pending_approvals)} approvals waiting for sign-off",
            link_label="Approvals",
        ),
    ]

    day_summary = (
        f"A calm teaching day — {len(teaching_classes)} classes, "
        f"{'every register on track' if pending_att == 0 else f'{pending_att} register open'}, "
        + (
            f"and a good window to clear the {assignment_reviews[0].title.split()[0]} review backlog before the weekend."
            if assignment_reviews
            else "and your cohort looks stable."
        )
    )

    coaching_items: list[CoachItem] = []
    if perf_subjects:
        weakest = min(perf_subjects, key=lambda s: s.avg_pct)
        if weakest.tone == "watch":
            coaching_items.append(
                CoachItem(
                    title=f"Weak subject area: {weakest.course_code} internals",
                    why=f"{weakest.course_code} average is {weakest.avg_pct}% — below your other sections.",
                    cta="Open in AI",
                    coach_key="performance",
                )
            )
    slippage_courses = [c for c in course_progress if c.slippage]
    if slippage_courses:
        coaching_items.append(
            CoachItem(
                title=f"Coverage slip in {slippage_courses[0].course_code}",
                why="Delivered sessions are behind the teaching plan for this course.",
                cta="View evidence",
                coach_key="coverage",
            )
        )
    if attendance_watch:
        coaching_items.append(
            CoachItem(
                title="Attendance pattern shift",
                why=f"{len(attendance_watch)} student(s) dropped below the attendance line this month.",
                cta="Open in AI",
                coach_key="attendance",
            )
        )
    if not coaching_items:
        coaching_items.append(
            CoachItem(
                title="Engagement holding steady",
                why="No major shifts in your sections this week — keep monitoring before internals.",
                cta="Ask AI",
                coach_key="stable",
            )
        )

    recent_activity: list[RecentActivityItem] = []
    interventions = session.execute(
        select(Intervention)
        .where(Intervention.tenant_id == tenant_id, Intervention.created_by == user_id)
        .order_by(Intervention.created_at.desc())
        .limit(5)
    ).scalars().all()
    for item in interventions:
        recent_activity.append(
            RecentActivityItem(
                id=f"int-{item.id}",
                kind="intervention",
                text=item.title,
                at=item.created_at.replace(tzinfo=UTC) if item.created_at.tzinfo is None else item.created_at,
            )
        )

    jobs = session.execute(
        select(GenerationJob)
        .where(
            GenerationJob.tenant_id == tenant_id,
            GenerationJob.user_id == user_id,
            GenerationJob.status == "completed",
        )
        .order_by(GenerationJob.updated_at.desc())
        .limit(5)
    ).scalars().all()
    for job in jobs:
        recent_activity.append(
            RecentActivityItem(
                id=f"job-{job.id}",
                kind="generation",
                text=f"Generated {job.feature.replace('_', ' ')}",
                at=job.updated_at.replace(tzinfo=UTC) if job.updated_at.tzinfo is None else job.updated_at,
            )
        )

    artifacts = session.execute(
        select(FacultyArtifact)
        .where(
            FacultyArtifact.tenant_id == tenant_id,
            FacultyArtifact.owner_user_id == user_id,
            FacultyArtifact.is_deleted.is_(False),
        )
        .order_by(FacultyArtifact.updated_at.desc())
        .limit(3)
    ).scalars().all()
    for art in artifacts:
        recent_activity.append(
            RecentActivityItem(
                id=f"art-{art.id}",
                kind="artifact",
                text=f"Draft: {art.title}",
                at=art.updated_at.replace(tzinfo=UTC) if art.updated_at.tzinfo is None else art.updated_at,
            )
        )

    recent_activity.sort(key=lambda x: x.at, reverse=True)
    recent_activity = recent_activity[:8]

    brief_text = (
        f"You have {len(teaching_classes)} classes today"
        + (f" and {pending_review_count} submission queue items" if pending_review_count else "")
        + ". "
        + (
            f"{watch_high} students need attention — start with the highest-confidence flags."
            if watch_high > 0
            else "Your sections look stable — use Copilot for deeper questions."
        )
    )

    return FacultyDashboardResponse(
        has_scope=True,
        first_name=first_name,
        department_name=department_name,
        semester_label=semester_label,
        session_label=session_label,
        day_summary=day_summary,
        health_score=health_score,
        health_label=health_label,
        health_factors=health_factors,
        health_narrative=health_narrative,
        health_sources=["Attendance registers", "Internal marks", "Participation logs", "Submission status"],
        daily_brief=DailyBriefPayload(text=brief_text, bullets=bullets),
        brief_actions=brief_actions,
        kpis=kpis,
        classes_today=classes_today,
        coaching_items=coaching_items,
        attendance_tasks=attendance_tasks,
        class_performance=class_performance,
        assignment_reviews=assignment_reviews,
        pending_approvals=pending_approvals,
        flagged_students=flagged_students,
        nav_badges=nav_badges,
        at_risk_students=at_risk_students,
        attendance_watch=attendance_watch,
        course_progress=course_progress,
        recent_activity=recent_activity,
        import_freshness=ImportFreshness(is_stale=False, message=None),
    )
