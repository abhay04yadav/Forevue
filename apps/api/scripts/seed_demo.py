"""Idempotent demo-tenant seeder (Phase 3 spec §C.1).

Writes canonical rows directly (bypassing ingestion + entity resolution, on
purpose — spec note above §C.2) so the named CSE cohort produces exact,
predictable findings/tiers, then calls recompute_for_tenant once to generate
real risk_assessments/findings/alerts from the engine. Run from `apps/api/`:

    python -m scripts.seed_demo
"""

from __future__ import annotations

from datetime import UTC, date, datetime, time, timedelta
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.core.rls import set_tenant_context
from app.core.security import hash_password
from app.models.canonical import (
    Assignment,
    Attendance,
    CampusAnnouncement,
    CareerProfile,
    Course,
    Department,
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
from app.models.ingestion import SourceSystem
from app.models.placement import PlacementDrive
from app.models.faculty_workspace import FacultyArtifact, FacultyCoursePlan, OfficeHourSlot
from app.models.risk import FacultyScope, Intervention, InterventionOutcome, RiskAssessment
from app.models.tenant import Tenant
from app.models.user import User
from app.repositories.risk_repository import RiskRepository
from app.services.risk.engine import recompute_for_tenant
from app.services.risk.evaluator.rules_evaluator import MODEL_VERSION

TENANT_NAME = "Demo Engineering College"
TENANT_SLUG = "demo-eng"
DEMO_PASSWORD = "Demo@12345"
TODAY = date.today()


def even_spread(n: int, present_count: int) -> list[bool]:
    """Evenly distributes `present_count` True flags across n slots."""
    result = []
    acc = 0
    for _ in range(n):
        acc += present_count
        if acc >= n:
            acc -= n
            result.append(True)
        else:
            result.append(False)
    return result


def _stamp(entity, source_system_id: UUID, record_id: str) -> None:
    entity.source_system_id = source_system_id
    entity.source_record_id = record_id
    entity.ingested_at = datetime.now(UTC)


def _get_or_create_tenant(session: Session) -> tuple[Tenant, bool]:
    existing = session.execute(select(Tenant).where(Tenant.slug == TENANT_SLUG)).scalar_one_or_none()
    if existing is not None:
        return existing, False
    tenant = Tenant(name=TENANT_NAME, slug=TENANT_SLUG)
    session.add(tenant)
    session.flush()
    return tenant, True


def _create_source_system(session: Session, tenant_id: UUID) -> SourceSystem:
    source = SourceSystem(tenant_id=tenant_id, name="seed", precedence=999)
    session.add(source)
    session.flush()
    return source


def _ensure_demo_users(session: Session, tenant_id: UUID) -> dict[str, User]:
    """Create demo logins when the tenant exists but users were removed."""
    users: dict[str, User] = {}
    for email, role in (
        ("principal@demo-eng.edu", "principal"),
        ("meera.iyer@demo-eng.edu", "faculty"),
        ("admin@demo-eng.edu", "admin"),
        ("registrar@demo-eng.edu", "registrar"),
        ("iqac@demo-eng.edu", "iqac"),
        ("hod.cse@demo-eng.edu", "hod"),
        ("placement@demo-eng.edu", "placement"),
    ):
        existing = session.execute(
            select(User).where(User.tenant_id == tenant_id, User.email == email)
        ).scalar_one_or_none()
        if existing is None:
            existing = User(tenant_id=tenant_id, email=email, password_hash=hash_password(DEMO_PASSWORD), role=role)
            session.add(existing)
            session.flush()
        users[email] = existing

    faculty = users["meera.iyer@demo-eng.edu"]
    hod = users["hod.cse@demo-eng.edu"]
    admin = users["admin@demo-eng.edu"]
    for scoped_user, dept in ((faculty, "CSE"), (hod, "CSE")):
        scope = session.execute(
            select(FacultyScope).where(
                FacultyScope.tenant_id == tenant_id,
                FacultyScope.user_id == scoped_user.id,
                FacultyScope.scope_type == "department",
                FacultyScope.scope_ref == dept,
            )
        ).scalar_one_or_none()
        if scope is None:
            session.add(
                FacultyScope(
                    tenant_id=tenant_id,
                    user_id=scoped_user.id,
                    scope_type="department",
                    scope_ref=dept,
                    created_by=admin.id,
                )
            )
    return users


def _ensure_student_user(session: Session, tenant_id: UUID) -> None:
    """Demo student login linked to Aarav Sharma (21CSE045)."""
    email = "aarav.sharma@demo-eng.edu"
    student = session.execute(
        select(Student).where(
            Student.tenant_id == tenant_id,
            Student.canonical_roll_no == "21CSE045",
        )
    ).scalar_one_or_none()
    if student is None:
        return

    existing = session.execute(
        select(User).where(User.tenant_id == tenant_id, User.email == email)
    ).scalar_one_or_none()
    if existing is None:
        session.add(
            User(
                tenant_id=tenant_id,
                email=email,
                password_hash=hash_password(DEMO_PASSWORD),
                role="student",
                student_id=student.id,
            )
        )
        session.flush()
    elif existing.student_id != student.id or existing.role != "student":
        existing.student_id = student.id
        existing.role = "student"
        session.flush()


def _ensure_placement_drives(session: Session, tenant_id: UUID, created_by: UUID | None) -> None:
    """Demo placement drives for the placement officer dashboard."""
    samples = (
        ("Campus hiring — TCS", "TCS", "active", TODAY + timedelta(days=14), "Main auditorium"),
        ("Infosys drive", "Infosys", "draft", TODAY + timedelta(days=30), "Placement cell"),
        ("Wipro off-campus", "Wipro", "closed", TODAY - timedelta(days=7), "Online"),
    )
    for title, company, status, drive_date, location in samples:
        existing = session.execute(
            select(PlacementDrive).where(
                PlacementDrive.tenant_id == tenant_id,
                PlacementDrive.title == title,
                PlacementDrive.is_deleted.is_(False),
            )
        ).scalar_one_or_none()
        if existing is None:
            session.add(
                PlacementDrive(
                    tenant_id=tenant_id,
                    title=title,
                    company_name=company,
                    status=status,
                    drive_date=drive_date,
                    location=location,
                    created_by=created_by,
                )
            )


def _ensure_faculty_workspace_data(session: Session, tenant_id: UUID, faculty_user_id: UUID) -> None:
    """Course plans, sample artifact, and office-hour slots for faculty demos."""
    courses = session.execute(
        select(Course).where(Course.tenant_id == tenant_id, Course.code.in_(("DBMS", "OS", "CN", "TOC")))
    ).scalars().all()
    syllabus_by_code = {
        "DBMS": ["ER model", "Normalization", "SQL queries", "Transactions"],
        "OS": ["Processes", "Scheduling", "Memory", "File systems"],
        "CN": ["OSI model", "TCP/IP", "Routing", "Network security"],
        "TOC": ["Finite automata", "Regular languages", "Context-free grammars", "Turing machines"],
    }
    plans = (
        ("DBMS", 16, 11),
        ("OS", 14, 10),
        ("CN", 14, 9),
        ("TOC", 12, 8),
    )
    for course in courses:
        planned, delivered = next((p, d) for code, p, d in plans if code == course.code)
        existing = session.execute(
            select(FacultyCoursePlan).where(
                FacultyCoursePlan.tenant_id == tenant_id,
                FacultyCoursePlan.owner_user_id == faculty_user_id,
                FacultyCoursePlan.course_id == course.id,
                FacultyCoursePlan.is_deleted.is_(False),
            )
        ).scalar_one_or_none()
        if existing is None:
            session.add(
                FacultyCoursePlan(
                    tenant_id=tenant_id,
                    owner_user_id=faculty_user_id,
                    course_id=course.id,
                    syllabus_units=syllabus_by_code.get(course.code, []),
                    planned_sessions=planned,
                    delivered_sessions=delivered,
                )
            )

    if session.execute(
        select(FacultyArtifact).where(
            FacultyArtifact.tenant_id == tenant_id,
            FacultyArtifact.owner_user_id == faculty_user_id,
            FacultyArtifact.title == "DBMS Unit test — Normalization (draft)",
        )
    ).scalar_one_or_none() is None:
        session.add(
            FacultyArtifact(
                tenant_id=tenant_id,
                owner_user_id=faculty_user_id,
                artifact_type="assessment_paper",
                title="DBMS Unit test — Normalization (draft)",
                status="draft",
                content_json={
                    "markdown": "# DBMS Unit test — Normalization\n\n*Sample demo artifact for Meera Iyer.*"
                },
            )
        )

    if session.execute(
        select(OfficeHourSlot).where(
            OfficeHourSlot.tenant_id == tenant_id,
            OfficeHourSlot.owner_user_id == faculty_user_id,
        ).limit(1)
    ).scalar_one_or_none() is None:
        session.add(
            OfficeHourSlot(
                tenant_id=tenant_id,
                owner_user_id=faculty_user_id,
                slot_date=TODAY + timedelta(days=2),
                start_time="15:00",
                end_time="16:00",
                location="CSE faculty room",
                status="open",
            )
        )


def _create_departments_and_programmes(
    session: Session, tenant_id: UUID, source_system_id: UUID
) -> dict[str, tuple[Department, Programme]]:
    by_dept: dict[str, tuple[Department, Programme]] = {}
    for dept_code, prog_name, prog_code in (
        ("CSE", "B.Tech Computer Science", "BTECH-CSE"),
        ("MECH", "B.Tech Mechanical Engineering", "BTECH-MECH"),
        ("ECE", "B.Tech Electronics & Communication", "BTECH-ECE"),
        ("CIVIL", "B.Tech Civil Engineering", "BTECH-CIVIL"),
    ):
        department = Department(tenant_id=tenant_id, code=dept_code, name=dept_code)
        _stamp(department, source_system_id, f"dept-{dept_code}")
        session.add(department)
        session.flush()

        programme = Programme(tenant_id=tenant_id, code=prog_code, name=prog_name, department_id=department.id)
        _stamp(programme, source_system_id, f"prog-{prog_code}")
        session.add(programme)
        session.flush()

        by_dept[dept_code] = (department, programme)
    return by_dept


def _create_courses(
    session: Session, tenant_id: UUID, programme_id: UUID, codes: list[str], source_system_id: UUID
) -> dict[str, Course]:
    courses: dict[str, Course] = {}
    for code in codes:
        course = Course(tenant_id=tenant_id, code=code, name=code, programme_id=programme_id)
        _stamp(course, source_system_id, f"course-{code}")
        session.add(course)
        session.flush()
        courses[code] = course
    return courses


def _create_student(
    session: Session,
    tenant_id: UUID,
    roll_no: str,
    name: str,
    dob: date | None,
    programme_id: UUID | None,
    source_system_id: UUID,
) -> Student:
    student = Student(
        tenant_id=tenant_id,
        canonical_roll_no=roll_no,
        name=name,
        dob=dob,
        admission_year=2021,
        programme_id=programme_id,
        status="active",
    )
    _stamp(student, source_system_id, roll_no)
    session.add(student)
    session.flush()
    return student


def _add_attendance(
    session: Session,
    tenant_id: UUID,
    student: Student,
    course_ids: list[UUID],
    presents: list[bool],
    source_system_id: UUID,
) -> None:
    start_date = TODAY - timedelta(days=len(presents))
    for i, present in enumerate(presents):
        row = Attendance(
            tenant_id=tenant_id,
            student_id=student.id,
            course_id=course_ids[i % len(course_ids)],
            class_date=start_date + timedelta(days=i),
            session_no=1,
            status="present" if present else "absent",
        )
        _stamp(row, source_system_id, f"{student.canonical_roll_no}-att-{i}")
        session.add(row)


def _add_marks(
    session: Session,
    tenant_id: UUID,
    student: Student,
    course_id: UUID,
    marks: list[int],
    source_system_id: UUID,
) -> None:
    gap_days = 30
    start_date = TODAY - timedelta(days=gap_days * len(marks))
    for i, obtained in enumerate(marks):
        row = InternalMark(
            tenant_id=tenant_id,
            student_id=student.id,
            course_id=course_id,
            assessment_type=f"CT{i + 1}",
            attempt=1,
            max_marks=Decimal(100),
            obtained=Decimal(obtained),
            assessment_date=start_date + timedelta(days=gap_days * i),
        )
        _stamp(row, source_system_id, f"{student.canonical_roll_no}-mark-{i}")
        session.add(row)


def _add_fee(
    session: Session, tenant_id: UUID, student: Student, overdue_days: int | None, source_system_id: UUID
) -> None:
    due_date = TODAY - timedelta(days=overdue_days) if overdue_days else TODAY + timedelta(days=60)
    row = Fee(
        tenant_id=tenant_id,
        student_id=student.id,
        term="2025-S2",
        fee_head="Tuition",
        amount_due=Decimal(60000),
        amount_paid=Decimal(0),
        due_date=due_date,
    )
    _stamp(row, source_system_id, f"{student.canonical_roll_no}-fee")
    session.add(row)


_NAMED_COHORT = [
    {
        "roll": "21CSE045",
        "name": "Aarav Sharma",
        "dob": date(2003, 4, 12),
        "attendance": even_spread(100, 60),
        "marks": [70, 36, 32],
        "fee_overdue_days": None,
    },
    {
        "roll": "21CSE009",
        "name": "Mohammed Faiz",
        "dob": date(2003, 1, 20),
        "attendance": even_spread(50, 39),
        "marks": [33, 35],
        "fee_overdue_days": 41,
    },
    {
        "roll": "21CSE112",
        "name": "Sneha Reddy",
        "dob": date(2003, 8, 30),
        "attendance": even_spread(76, 59) + [True] * 10 + [False] * 2 + [True] * 8 + [False] * 4,
        "marks": [66, 47],
        "fee_overdue_days": None,
    },
    {
        "roll": "21CSE077",
        "name": "Ananya Nair",
        "dob": date(2008, 10, 12),
        "attendance": even_spread(30, 21),
        "marks": [58, 55],
        "fee_overdue_days": None,
    },
    {
        "roll": "21CSE058",
        "name": "Diya Patel",
        "dob": date(2008, 12, 1),
        "attendance": even_spread(30, 21),
        "marks": [72, 70],
        "fee_overdue_days": None,
    },
    {
        "roll": "21CSE131",
        "name": "Rohit Verma",
        "dob": date(2003, 6, 5),
        "attendance": even_spread(50, 40),
        "marks": [61, 44],
        "fee_overdue_days": None,
    },
    {
        "roll": "21CSE200",
        "name": "Karthik Menon",
        "dob": date(2003, 3, 3),
        "attendance": even_spread(50, 48),
        "marks": [75, 78],
        "fee_overdue_days": 35,
    },
]

_FILLER_ROLL_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18]
_FILLER_NAMES = [
    "Priya Iyer",
    "Rahul Krishnan",
    "Sanya Gupta",
    "Vikram Rao",
    "Arjun Kumar",
    "Divya Menon",
    "Karan Singh",
    "Pooja Reddy",
    "Aditya Verma",
    "Nikhil Joshi",
    "Tanvi Shah",
    "Rohan Desai",
    "Ishita Bose",
    "Siddharth Nair",
    "Kavya Krishnan",
    "Varun Pillai",
    "Neha Agarwal",
]

_OTHER_DEPT_NAMES = [
    "Akash Mehta",
    "Bhavna Rathi",
    "Chetan Yadav",
    "Deepika Suresh",
    "Eshwar Pillai",
    "Farah Sheikh",
    "Gaurav Malhotra",
    "Harini Subramaniam",
    "Imran Khan",
    "Jyoti Bhatt",
    "Kunal Saxena",
    "Lavanya Iyer",
    "Manoj Tiwari",
    "Nandini Rao",
    "Om Prakash",
    "Pallavi Joshi",
    "Quasim Ali",
    "Rashmi Nambiar",
    "Sahil Kapoor",
    "Trisha Banerjee",
    "Uday Chauhan",
    "Vidya Krishnamurthy",
    "Wasim Ansari",
    "Yamini Pawar",
    "Zoya Ahmed",
    "Abhinav Bhatt",
    "Charu Lakhani",
    "Devansh Oberoi",
    "Esha Trivedi",
    "Faizan Sheikh",
    "Gita Nair",
    "Harsh Vardhan",
    "Inaya Sayed",
    "Jatin Mahajan",
    "Kiran Bedi",
    "Lokesh Reddy",
    "Maya Sundaram",
    "Naveen Choudhary",
    "Ojas Deshpande",
    "Priyanka Bose",
    "Qadir Baig",
    "Riya Sharma",
    "Sameer Kulkarni",
    "Tara Menon",
    "Umang Shah",
    "Vivaan Kapoor",
    "Wendy Fernandes",
    "Yash Thakur",
    "Zara Hussain",
    "Ananth Iyer",
    "Bela Shah",
    "Chirag Patel",
    "Disha Goel",
    "Elina Roy",
    "Farhan Qureshi",
]


def _other_dept_profile(index: int) -> tuple[list[bool], list[int]]:
    bucket = index % 10
    if bucket == 9:
        return even_spread(40, 22), [50, 30]
    if bucket in (7, 8):
        return even_spread(40, 27), [60, 62]
    return even_spread(60, 54), [65, 68]


def _seed_named_cohort(
    session: Session,
    tenant_id: UUID,
    cse_programme_id: UUID,
    cse_course_ids: list[UUID],
    primary_course_id: UUID,
    source_system_id: UUID,
    faculty: User,
) -> dict[str, Student]:
    students: dict[str, Student] = {}
    for spec in _NAMED_COHORT:
        student = _create_student(
            session, tenant_id, spec["roll"], spec["name"], spec["dob"], cse_programme_id, source_system_id
        )
        _add_attendance(session, tenant_id, student, cse_course_ids, spec["attendance"], source_system_id)
        _add_marks(session, tenant_id, student, primary_course_id, spec["marks"], source_system_id)
        _add_fee(session, tenant_id, student, spec["fee_overdue_days"], source_system_id)
        students[spec["roll"]] = student

    aarav = students["21CSE045"]
    for tier, score, days_ago in (("low", 10.0, 60), ("watch", 35.0, 21)):
        session.add(
            RiskAssessment(
                tenant_id=tenant_id,
                student_id=aarav.id,
                is_current=False,
                model_type="rules",
                model_version=MODEL_VERSION,
                config_version=1,
                overall_score=score,
                tier=tier,
                subject_minor_status="adult",
                signals_snapshot={},
                triggered_by="manual",
                computed_at=datetime.now(UTC) - timedelta(days=days_ago),
            )
        )

    intervention = Intervention(
        tenant_id=tenant_id,
        student_id=aarav.id,
        type="mentor_meeting",
        status="completed",
        title="Mentor check-in with Dr. Iyer",
        notes="Discussed declining DBMS internals and attendance; agreed a remedial study plan.",
        assigned_to=faculty.id,
        created_by=faculty.id,
    )
    session.add(intervention)
    session.flush()
    session.add(
        InterventionOutcome(
            tenant_id=tenant_id,
            intervention_id=intervention.id,
            outcome="no_change",
            notes="Follow-up scheduled after the next internal assessment cycle.",
            recorded_by=faculty.id,
        )
    )
    return students


def _seed_filler_cohort(
    session: Session,
    tenant_id: UUID,
    cse_programme_id: UUID,
    cse_course_ids: list[UUID],
    primary_course_id: UUID,
    source_system_id: UUID,
) -> None:
    for roll_num, name in zip(_FILLER_ROLL_NUMBERS, _FILLER_NAMES, strict=True):
        student = _create_student(
            session, tenant_id, f"21CSE{roll_num:03d}", name, date(2003, 5, 15), cse_programme_id, source_system_id
        )
        _add_attendance(session, tenant_id, student, cse_course_ids, even_spread(60, 54), source_system_id)
        _add_marks(session, tenant_id, student, primary_course_id, [65, 68], source_system_id)
        _add_fee(session, tenant_id, student, None, source_system_id)


def _seed_other_departments(
    session: Session,
    tenant_id: UUID,
    dept_programmes: dict[str, tuple[Department, Programme]],
    dept_courses: dict[str, Course],
    source_system_id: UUID,
) -> None:
    other_depts = ["MECH", "ECE", "CIVIL"]
    total_with_dept = 40
    total_unassigned = 15

    for i, name in enumerate(_OTHER_DEPT_NAMES[: total_with_dept + total_unassigned]):
        if i < total_with_dept:
            dept_code = other_depts[i % len(other_depts)]
            programme_id = dept_programmes[dept_code][1].id
            course_id = dept_courses[dept_code].id
            roll_no = f"21{dept_code}{i:03d}"
        else:
            programme_id = None
            course_id = dept_courses["MECH"].id
            roll_no = f"21UNA{i:03d}"

        student = _create_student(session, tenant_id, roll_no, name, date(2003, 9, 1), programme_id, source_system_id)
        presents, marks = _other_dept_profile(i)
        _add_attendance(session, tenant_id, student, [course_id], presents, source_system_id)
        _add_marks(session, tenant_id, student, course_id, marks, source_system_id)
        _add_fee(session, tenant_id, student, None, source_system_id)


def _ensure_student_dashboard_data(
    session: Session,
    tenant_id: UUID,
    source_system_id: UUID | None,
) -> None:
    """Idempotent dashboard seed for Aarav Sharma (21CSE045) — runs on existing tenants."""
    student = session.execute(
        select(Student).where(Student.tenant_id == tenant_id, Student.canonical_roll_no == "21CSE045")
    ).scalar_one_or_none()
    if student is None:
        return

    courses = {
        row.code: row
        for row in session.execute(
            select(Course).where(Course.tenant_id == tenant_id, Course.is_deleted.is_(False))
        ).scalars()
    }
    if not courses:
        return

    # Friendly names for CSE courses used in the dashboard design
    name_map = {
        "DBMS": "DBMS",
        "OS": "Operating Systems",
        "CN": "Computer Networks",
        "TOC": "Theory of Computation",
        "DSA": "DSA",
        "MATH": "Mathematics",
    }
    for code, course in courses.items():
        if code in name_map and course.name != name_map[code]:
            course.name = name_map[code]

    dbms = courses.get("DBMS")
    os_course = courses.get("OS")
    dsa = courses.get("DSA") or dbms
    if dbms is None:
        return

    existing_tt = session.execute(
        select(TimetableSession.id).where(
            TimetableSession.tenant_id == tenant_id,
            TimetableSession.student_id == student.id,
            TimetableSession.session_date == TODAY,
        ).limit(1)
    ).scalar_one_or_none()
    if existing_tt is None:
        sessions = [
            (time(9, 0), time(10, 0), "lecture", "DBMS lecture", dbms.id, "Room A-204", "Dr. Rao", None),
            (time(10, 30), time(11, 0), "free", "Free slot", None, None, None, "Good moment to get ahead on DSA revision."),
            (time(11, 0), time(12, 30), "lab", "Operating Systems lab", os_course.id if os_course else dbms.id, "Lab 3", "Prof. Iyer", None),
            (time(14, 0), time(15, 0), "tutorial", "DSA tutorial", dsa.id, "Room B-110", "Dr. Nair", None),
            (time(16, 0), time(16, 30), "assignment", "DBMS ER-model assignment due", dbms.id, None, None, "Due today"),
            (time(18, 0), time(19, 0), "free", "Optional: DSA practice set", dsa.id, None, None, "Keep your streak going with a short set."),
        ]
        for i, (start, end, stype, title, cid, room, faculty, notes) in enumerate(sessions):
            row = TimetableSession(
                tenant_id=tenant_id,
                student_id=student.id,
                course_id=cid,
                session_date=TODAY,
                start_time=start,
                end_time=end,
                session_type=stype,
                title=title,
                room=room,
                faculty_name=faculty,
                notes=notes,
            )
            if source_system_id:
                _stamp(row, source_system_id, f"tt-aarav-{i}")
            session.add(row)

    existing_asg = session.execute(
        select(Assignment.id).where(
            Assignment.tenant_id == tenant_id, Assignment.student_id == student.id
        ).limit(1)
    ).scalar_one_or_none()
    if existing_asg is None:
        due_today = datetime.now(UTC).replace(hour=16, minute=0, second=0, microsecond=0)
        due_later = datetime.now(UTC) + timedelta(days=5)
        for title, cid, due, priority, progress in (
            ("DBMS ER-model", dbms.id, due_today, "soon", 70),
            ("DSA problem set 4", dsa.id, due_later, "planned", 45),
        ):
            row = Assignment(
                tenant_id=tenant_id,
                student_id=student.id,
                course_id=cid,
                title=title,
                due_at=due,
                status="open",
                progress_pct=progress,
                priority=priority,
            )
            if source_system_id:
                _stamp(row, source_system_id, f"asg-{title}")
            session.add(row)

    existing_sem = session.execute(
        select(SemesterResult.id).where(
            SemesterResult.tenant_id == tenant_id,
            SemesterResult.student_id == student.id,
            SemesterResult.course_id.is_(None),
        ).limit(1)
    ).scalar_one_or_none()
    if existing_sem is None:
        for sem, sgpa in ((1, Decimal("78")), (2, Decimal("80")), (3, Decimal("82")), (4, Decimal("84"))):
            row = SemesterResult(
                tenant_id=tenant_id,
                student_id=student.id,
                course_id=None,
                academic_year="2025-26",
                semester=sem,
                sgpa=sgpa,
                result_status="pass",
            )
            if source_system_id:
                _stamp(row, source_system_id, f"sem-aarav-{sem}")
            session.add(row)

    existing_campus = session.execute(
        select(CampusAnnouncement.id).where(CampusAnnouncement.tenant_id == tenant_id).limit(1)
    ).scalar_one_or_none()
    if existing_campus is None:
        now = datetime.now(UTC)
        for title, body, location, days_ago, closes_days in (
            ("Hackathon 2026", "Registrations close Friday", "Innovation Lab", 1, 3),
            ("Guest lecture: Systems at scale", "Tomorrow, 3 PM", "Auditorium", 0, 1),
            ("Merit scholarship applications", "2 weeks left", "Admin office", 2, 14),
            ("Placement talk at 5 PM", "Auditorium · Today", "Auditorium", 0, 0),
        ):
            session.add(
                CampusAnnouncement(
                    tenant_id=tenant_id,
                    title=title,
                    body=body,
                    location=location,
                    published_at=now - timedelta(days=days_ago),
                    closes_at=now + timedelta(days=closes_days) if closes_days else None,
                )
            )

    existing_notif = session.execute(
        select(StudentNotification.id).where(
            StudentNotification.tenant_id == tenant_id, StudentNotification.student_id == student.id
        ).limit(1)
    ).scalar_one_or_none()
    if existing_notif is None:
        now = datetime.now(UTC)
        for title, body, tone, hours_ago in (
            ("Assignment due at 4:00 PM", "DBMS ER-model", "alert", 1),
            ("Hackathon registrations close Friday", None, "default", 24),
            ("Daily brief is ready", None, "ai", 0),
        ):
            session.add(
                StudentNotification(
                    tenant_id=tenant_id,
                    student_id=student.id,
                    title=title,
                    body=body,
                    tone=tone,
                    created_at=now - timedelta(hours=hours_ago),
                )
            )

    existing_act = session.execute(
        select(StudentActivity.id).where(
            StudentActivity.tenant_id == tenant_id, StudentActivity.student_id == student.id
        ).limit(1)
    ).scalar_one_or_none()
    if existing_act is None:
        now = datetime.now(UTC)
        for atype, summary, hours_ago in (
            ("submission", "Submitted DSA problem set 3", 24),
            ("ai", "Forevue surfaced a study plan", 48),
            ("timetable", "Timetable updated for next week", 72),
            ("ai", "Asked Forevue about DBMS normalization", 0.3),
            ("ai", "Generated revision notes for OS", 2),
        ):
            session.add(
                StudentActivity(
                    tenant_id=tenant_id,
                    student_id=student.id,
                    activity_type=atype,
                    summary=summary,
                    created_at=now - timedelta(hours=hours_ago),
                )
            )

    existing_career = session.execute(
        select(CareerProfile.id).where(
            CareerProfile.tenant_id == tenant_id, CareerProfile.student_id == student.id
        ).limit(1)
    ).scalar_one_or_none()
    if existing_career is None:
        session.add(
            CareerProfile(
                tenant_id=tenant_id,
                student_id=student.id,
                readiness_score=68,
                skills=["Python", "DSA", "SQL", "React", "Communication"],
                opportunities=[
                    {"title": "Summer internship drive", "subtitle": "Applications open · 2 weeks left", "icon": "briefcase"},
                    {"title": "Mock interview workshop", "subtitle": "Friday · Placement cell", "icon": "graduation"},
                ],
                credits_completed=86,
                credits_required=120,
            )
        )

    existing_exam = session.execute(
        select(UpcomingExam.id).where(
            UpcomingExam.tenant_id == tenant_id, UpcomingExam.student_id == student.id
        ).limit(1)
    ).scalar_one_or_none()
    if existing_exam is None:
        exam_date = TODAY + timedelta(days=9)
        for cid, name in ((dsa.id, "DSA exam"), (dbms.id, "DBMS exam")):
            row = UpcomingExam(
                tenant_id=tenant_id,
                student_id=student.id,
                course_id=cid,
                exam_name=name,
                exam_date=exam_date if name.startswith("DSA") else TODAY + timedelta(days=6),
            )
            if source_system_id:
                _stamp(row, source_system_id, f"exam-{name}")
            session.add(row)


def seed() -> None:
    session = SessionLocal()
    try:
        with session.begin():
            tenant, created = _get_or_create_tenant(session)
            set_tenant_context(session, tenant.id)

            if created:
                source = _create_source_system(session, tenant.id)
                users = _ensure_demo_users(session, tenant.id)
                dept_programmes = _create_departments_and_programmes(session, tenant.id, source.id)
                _, cse_programme = dept_programmes["CSE"]
                cse_courses = _create_courses(
                    session, tenant.id, cse_programme.id, ["DBMS", "OS", "CN", "TOC"], source.id
                )
                cse_course_ids = [c.id for c in cse_courses.values()]
                primary_course_id = cse_courses["DBMS"].id

                dept_courses = {"CSE": cse_courses["DBMS"]}
                for dept_code in ("MECH", "ECE", "CIVIL"):
                    _, programme = dept_programmes[dept_code]
                    courses = _create_courses(session, tenant.id, programme.id, [f"{dept_code}101"], source.id)
                    dept_courses[dept_code] = courses[f"{dept_code}101"]

                faculty = users["meera.iyer@demo-eng.edu"]

                _seed_named_cohort(
                    session, tenant.id, cse_programme.id, cse_course_ids, primary_course_id, source.id, faculty
                )
                _seed_filler_cohort(
                    session, tenant.id, cse_programme.id, cse_course_ids, primary_course_id, source.id
                )
                _seed_other_departments(session, tenant.id, dept_programmes, dept_courses, source.id)
                session.flush()
                print(f"Created tenant '{TENANT_NAME}' (slug={TENANT_SLUG}, id={tenant.id}).")
            else:
                print(f"Tenant '{TENANT_NAME}' (slug={TENANT_SLUG}) already exists -- skipping data creation.")
                _ensure_demo_users(session, tenant.id)

            source = session.execute(
                select(SourceSystem).where(SourceSystem.tenant_id == tenant.id).limit(1)
            ).scalar_one_or_none()
            _ensure_student_dashboard_data(session, tenant.id, source.id if source else None)
            _ensure_student_user(session, tenant.id)
            placement_user = session.execute(
                select(User).where(User.tenant_id == tenant.id, User.email == "placement@demo-eng.edu")
            ).scalar_one_or_none()
            admin_user = session.execute(
                select(User).where(User.tenant_id == tenant.id, User.email == "admin@demo-eng.edu")
            ).scalar_one_or_none()
            _ensure_placement_drives(
                session, tenant.id, (placement_user or admin_user).id if (placement_user or admin_user) else None
            )
            faculty_user = session.execute(
                select(User).where(User.tenant_id == tenant.id, User.email == "meera.iyer@demo-eng.edu")
            ).scalar_one_or_none()
            if faculty_user:
                _ensure_faculty_workspace_data(session, tenant.id, faculty_user.id)

            summary = recompute_for_tenant(session, tenant.id, triggered_by="manual")

        print()
        print("Login credentials (password for all): " + DEMO_PASSWORD)
        print("  College (tenant slug): " + TENANT_SLUG)
        print("  principal@demo-eng.edu  (role: principal -- Dashboard)")
        print("  registrar@demo-eng.edu  (role: registrar -- Dashboard)")
        print("  iqac@demo-eng.edu       (role: iqac -- Dashboard)")
        print("  meera.iyer@demo-eng.edu (role: faculty, scope: department=CSE -- Risk Board)")
        print("  hod.cse@demo-eng.edu    (role: hod, scope: department=CSE -- Department)")
        print("  placement@demo-eng.edu  (role: placement -- Placement)")
        print("  aarav.sharma@demo-eng.edu (role: student -- My day)")
        print("  admin@demo-eng.edu      (role: admin -- Dashboard + Admin)")
        print()
        print(f"Tenant id: {tenant.id}")
        print(
            f"Recompute summary: evaluated={summary.evaluated} changed={summary.changed} "
            f"unchanged={summary.unchanged} skipped={summary.skipped} errors={len(summary.errors)}"
        )

        with session.begin():
            set_tenant_context(session, tenant.id)
            data = RiskRepository(session, tenant.id).summary(student_ids=None)
            print(f"Tier counts: {data['by_tier']} (total_assessed={data['total_assessed']})")
    finally:
        session.close()


if __name__ == "__main__":
    seed()
