"""Re-exports for backward compatibility — canonical student read schemas."""

from app.schemas.student_dashboard import (
    AttendanceSummary,
    FeeSummary,
    InternalMarkSummary,
    Student360Response,
)

__all__ = ["AttendanceSummary", "FeeSummary", "InternalMarkSummary", "Student360Response"]
