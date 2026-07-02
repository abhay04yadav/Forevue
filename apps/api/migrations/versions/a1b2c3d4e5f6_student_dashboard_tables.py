"""student_dashboard_tables

Revision ID: a1b2c3d4e5f6
Revises: f3c8a1b2d4e5
Create Date: 2026-07-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "f3c8a1b2d4e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("semester_results", sa.Column("sgpa", sa.Numeric(), nullable=True))

    op.create_table(
        "timetable_sessions",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("source_system_id", sa.UUID(), nullable=True),
        sa.Column("source_record_id", sa.String(), nullable=True),
        sa.Column("import_batch_id", sa.UUID(), nullable=True),
        sa.Column("ingested_at", sa.DateTime(), nullable=True),
        sa.Column("student_id", sa.UUID(), nullable=False),
        sa.Column("course_id", sa.UUID(), nullable=True),
        sa.Column("session_date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=True),
        sa.Column("session_type", sa.String(), server_default=sa.text("'lecture'"), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("room", sa.String(), nullable=True),
        sa.Column("faculty_name", sa.String(), nullable=True),
        sa.Column("notes", sa.String(), nullable=True),
        sa.CheckConstraint(
            "session_type IN ('lecture', 'lab', 'tutorial', 'free', 'assignment')",
            name="ck_timetable_sessions_type",
        ),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"]),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"]),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "tenant_id", "student_id", "session_date", "start_time", "title",
            name="uq_timetable_sessions_natural_key",
        ),
    )
    op.create_index(op.f("ix_timetable_sessions_tenant_id"), "timetable_sessions", ["tenant_id"], unique=False)

    op.create_table(
        "assignments",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("source_system_id", sa.UUID(), nullable=True),
        sa.Column("source_record_id", sa.String(), nullable=True),
        sa.Column("import_batch_id", sa.UUID(), nullable=True),
        sa.Column("ingested_at", sa.DateTime(), nullable=True),
        sa.Column("student_id", sa.UUID(), nullable=False),
        sa.Column("course_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(), server_default=sa.text("'open'"), nullable=False),
        sa.Column("progress_pct", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("priority", sa.String(), server_default=sa.text("'normal'"), nullable=False),
        sa.CheckConstraint("status IN ('open', 'submitted')", name="ck_assignments_status"),
        sa.CheckConstraint("priority IN ('soon', 'planned', 'normal')", name="ck_assignments_priority"),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"]),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"]),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("tenant_id", "student_id", "course_id", "title", name="uq_assignments_natural_key"),
    )
    op.create_index(op.f("ix_assignments_tenant_id"), "assignments", ["tenant_id"], unique=False)

    op.create_table(
        "campus_announcements",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("body", sa.String(), nullable=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("closes_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_campus_announcements_tenant_id"), "campus_announcements", ["tenant_id"], unique=False)

    op.create_table(
        "student_notifications",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("student_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("body", sa.String(), nullable=True),
        sa.Column("tone", sa.String(), server_default=sa.text("'default'"), nullable=False),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("tone IN ('default', 'alert', 'ai')", name="ck_student_notifications_tone"),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"]),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_student_notifications_tenant_id"), "student_notifications", ["tenant_id"], unique=False)

    op.create_table(
        "student_activity",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("student_id", sa.UUID(), nullable=False),
        sa.Column("activity_type", sa.String(), nullable=False),
        sa.Column("summary", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"]),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_student_activity_tenant_id"), "student_activity", ["tenant_id"], unique=False)

    op.create_table(
        "career_profiles",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("student_id", sa.UUID(), nullable=False),
        sa.Column("readiness_score", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("skills", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'[]'::jsonb"), nullable=False),
        sa.Column("opportunities", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'[]'::jsonb"), nullable=False),
        sa.Column("credits_completed", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("credits_required", sa.Integer(), server_default=sa.text("120"), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"]),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("tenant_id", "student_id", name="uq_career_profiles_student"),
    )
    op.create_index(op.f("ix_career_profiles_tenant_id"), "career_profiles", ["tenant_id"], unique=False)

    op.create_table(
        "upcoming_exams",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("source_system_id", sa.UUID(), nullable=True),
        sa.Column("source_record_id", sa.String(), nullable=True),
        sa.Column("import_batch_id", sa.UUID(), nullable=True),
        sa.Column("ingested_at", sa.DateTime(), nullable=True),
        sa.Column("student_id", sa.UUID(), nullable=False),
        sa.Column("course_id", sa.UUID(), nullable=False),
        sa.Column("exam_name", sa.String(), nullable=False),
        sa.Column("exam_date", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"]),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"]),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("tenant_id", "student_id", "course_id", "exam_name", name="uq_upcoming_exams_natural_key"),
    )
    op.create_index(op.f("ix_upcoming_exams_tenant_id"), "upcoming_exams", ["tenant_id"], unique=False)

    _NEW_TABLES = (
        "timetable_sessions",
        "assignments",
        "campus_announcements",
        "student_notifications",
        "student_activity",
        "career_profiles",
        "upcoming_exams",
    )
    for table in _NEW_TABLES:
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
        op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")
        op.execute(
            f"""
            CREATE POLICY tenant_isolation ON {table}
              USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
              WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid)
            """
        )
        op.execute(f"GRANT SELECT, INSERT, UPDATE ON {table} TO app_user")


def downgrade() -> None:
    _NEW_TABLES = (
        "upcoming_exams",
        "career_profiles",
        "student_activity",
        "student_notifications",
        "campus_announcements",
        "assignments",
        "timetable_sessions",
    )
    for table in _NEW_TABLES:
        op.execute(f"DROP POLICY IF EXISTS tenant_isolation ON {table}")
        op.execute(f"REVOKE ALL ON {table} FROM app_user")

    op.drop_index(op.f("ix_upcoming_exams_tenant_id"), table_name="upcoming_exams")
    op.drop_table("upcoming_exams")
    op.drop_index(op.f("ix_career_profiles_tenant_id"), table_name="career_profiles")
    op.drop_table("career_profiles")
    op.drop_index(op.f("ix_student_activity_tenant_id"), table_name="student_activity")
    op.drop_table("student_activity")
    op.drop_index(op.f("ix_student_notifications_tenant_id"), table_name="student_notifications")
    op.drop_table("student_notifications")
    op.drop_index(op.f("ix_campus_announcements_tenant_id"), table_name="campus_announcements")
    op.drop_table("campus_announcements")
    op.drop_index(op.f("ix_assignments_tenant_id"), table_name="assignments")
    op.drop_table("assignments")
    op.drop_index(op.f("ix_timetable_sessions_tenant_id"), table_name="timetable_sessions")
    op.drop_table("timetable_sessions")
    op.drop_column("semester_results", "sgpa")
