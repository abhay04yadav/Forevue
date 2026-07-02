from datetime import date, datetime
from uuid import UUID

from sqlalchemy import ForeignKey, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, PKMixin, SoftDeleteMixin, TenantMixin, TimestampMixin

ARTIFACT_STATUSES = ("draft", "review", "approved", "published")
JOB_STATUSES = ("queued", "running", "completed", "failed")
GENERATION_FEATURES = (
    "lecture_plan",
    "assessment_paper",
    "assessment_quiz",
    "assignment",
    "notice",
    "email",
)


class FacultyCoursePlan(PKMixin, TenantMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "faculty_course_plans"

    course_id: Mapped[UUID] = mapped_column(ForeignKey("courses.id"), nullable=False, index=True)
    owner_user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    syllabus_units: Mapped[list] = mapped_column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))
    planned_sessions: Mapped[int] = mapped_column(nullable=False, server_default=text("0"))
    delivered_sessions: Mapped[int] = mapped_column(nullable=False, server_default=text("0"))


class FacultyArtifact(PKMixin, TenantMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "faculty_artifacts"

    owner_user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    artifact_type: Mapped[str] = mapped_column(nullable=False)
    title: Mapped[str] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(nullable=False, server_default=text("'draft'"))
    content_json: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    source_job_id: Mapped[UUID | None] = mapped_column(nullable=True)
    version: Mapped[int] = mapped_column(nullable=False, server_default=text("1"))


class GenerationJob(PKMixin, TenantMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "generation_jobs"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    feature: Mapped[str] = mapped_column(nullable=False)
    params_json: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    status: Mapped[str] = mapped_column(nullable=False, server_default=text("'queued'"))
    result_artifact_id: Mapped[UUID | None] = mapped_column(ForeignKey("faculty_artifacts.id"), nullable=True)
    error_message: Mapped[str | None] = mapped_column(nullable=True)


class OfficeHourSlot(PKMixin, TenantMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "office_hour_slots"

    owner_user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    slot_date: Mapped[date] = mapped_column(nullable=False)
    start_time: Mapped[str] = mapped_column(nullable=False)
    end_time: Mapped[str] = mapped_column(nullable=False)
    location: Mapped[str | None] = mapped_column(nullable=True)
    status: Mapped[str] = mapped_column(nullable=False, server_default=text("'open'"))
    booking_note: Mapped[str | None] = mapped_column(nullable=True)
