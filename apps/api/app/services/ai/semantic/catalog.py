"""Governed semantic metric catalog with role gates (Ch3 §5, Ch4 §4).

Only metrics defined here may be queried. Role scoping filters the catalog
before any model or client sees it — the menu is filtered server-side.
"""

from app.models.user import VALID_ROLES
from app.services.ai.semantic.types import MetricDefinition

_PRIVILEGED = frozenset({"admin", "principal", "registrar", "iqac"})
_FACULTY_AND_PRIVILEGED = _PRIVILEGED | {"faculty"}

DIMENSION_DEPARTMENT = "department"
DIMENSION_PROGRAMME = "programme"
DIMENSION_TIER = "tier"
DIMENSION_RISK_TYPE = "risk_type"

ALL_DIMENSIONS = frozenset({DIMENSION_DEPARTMENT, DIMENSION_PROGRAMME, DIMENSION_TIER, DIMENSION_RISK_TYPE})

METRICS: dict[str, MetricDefinition] = {
    "student_count": MetricDefinition(
        id="student_count",
        label="Student count",
        description="Number of students in scope.",
        value_type="integer",
        allowed_dimensions=frozenset({DIMENSION_DEPARTMENT, DIMENSION_PROGRAMME}),
        allowed_filters=frozenset({DIMENSION_DEPARTMENT, DIMENSION_PROGRAMME}),
        allowed_roles=_FACULTY_AND_PRIVILEGED,
    ),
    "assessed_student_count": MetricDefinition(
        id="assessed_student_count",
        label="Assessed student count",
        description="Students with a current risk assessment.",
        value_type="integer",
        allowed_dimensions=frozenset({DIMENSION_DEPARTMENT, DIMENSION_TIER}),
        allowed_filters=frozenset({DIMENSION_DEPARTMENT, DIMENSION_TIER}),
        allowed_roles=_FACULTY_AND_PRIVILEGED,
    ),
    "risk_tier_count": MetricDefinition(
        id="risk_tier_count",
        label="Risk tier distribution",
        description="Count of currently assessed students by risk tier.",
        value_type="integer",
        allowed_dimensions=frozenset({DIMENSION_DEPARTMENT, DIMENSION_TIER}),
        allowed_filters=frozenset({DIMENSION_DEPARTMENT, DIMENSION_TIER}),
        allowed_roles=_FACULTY_AND_PRIVILEGED,
    ),
    "avg_risk_score": MetricDefinition(
        id="avg_risk_score",
        label="Average risk score",
        description="Mean overall risk score for currently assessed students.",
        value_type="float",
        allowed_dimensions=frozenset({DIMENSION_DEPARTMENT}),
        allowed_filters=frozenset({DIMENSION_DEPARTMENT, DIMENSION_TIER}),
        allowed_roles=_FACULTY_AND_PRIVILEGED,
    ),
    "students_with_risk_type": MetricDefinition(
        id="students_with_risk_type",
        label="Students by risk type",
        description="Distinct students with at least one current finding of the given risk type.",
        value_type="integer",
        allowed_dimensions=frozenset({DIMENSION_RISK_TYPE, DIMENSION_DEPARTMENT}),
        allowed_filters=frozenset({DIMENSION_RISK_TYPE, DIMENSION_DEPARTMENT}),
        allowed_roles=_FACULTY_AND_PRIVILEGED,
    ),
    "attendance_present_rate": MetricDefinition(
        id="attendance_present_rate",
        label="Attendance present rate",
        description="Percentage of attendance records marked present for students in scope.",
        value_type="percentage",
        allowed_dimensions=frozenset({DIMENSION_DEPARTMENT, DIMENSION_PROGRAMME}),
        allowed_filters=frozenset({DIMENSION_DEPARTMENT, DIMENSION_PROGRAMME}),
        allowed_roles=_FACULTY_AND_PRIVILEGED,
    ),
    "avg_internal_mark_pct": MetricDefinition(
        id="avg_internal_mark_pct",
        label="Average internal mark percentage",
        description="Mean obtained/max_marks percentage across internal mark records in scope.",
        value_type="percentage",
        allowed_dimensions=frozenset({DIMENSION_DEPARTMENT, DIMENSION_PROGRAMME}),
        allowed_filters=frozenset({DIMENSION_DEPARTMENT, DIMENSION_PROGRAMME}),
        allowed_roles=_FACULTY_AND_PRIVILEGED,
    ),
}


def metrics_for_role(role: str) -> list[MetricDefinition]:
    if role not in VALID_ROLES:
        return []
    return [metric for metric in METRICS.values() if role in metric.allowed_roles]


def get_metric(metric_id: str) -> MetricDefinition | None:
    return METRICS.get(metric_id)
