"""Deterministic semantic query executor (Ch3 §5, AI-5.1).

Validates governed selections, builds parameterised read-only queries against
canonical tables under RLS, and applies role-based student scoping.
"""

from collections.abc import Sequence
from typing import Any
from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.canonical import Attendance, Department, InternalMark, Programme, Student
from app.models.risk import RISK_TYPES, RiskAssessment, RiskFinding
from app.services.ai.semantic import catalog
from app.services.ai.semantic.types import (
    DEFAULT_SEMANTIC_LIMIT,
    MAX_SEMANTIC_ROWS,
    MetricDefinition,
    SemanticQueryResult,
    SemanticSelection,
)
from app.services.risk.scoping import visible_student_ids

_UNASSIGNED_DEPARTMENT = "Unassigned"


class SemanticAbstentionError(AppException):
    """Raised when a selection cannot be satisfied from governed data."""

    detail = "I can't answer that from your data."


def execute_semantic_query(
    session: Session,
    *,
    tenant_id: UUID,
    role: str,
    user_id: UUID,
    selection: SemanticSelection,
) -> SemanticQueryResult:
    metric = _resolve_metric(selection.metric, role)
    _validate_selection(metric, selection)

    visible_ids = visible_student_ids(session, tenant_id, role, user_id)
    if visible_ids is not None and not visible_ids:
        return _empty_result(metric, selection, visible_ids)

    limit = min(selection.limit, MAX_SEMANTIC_ROWS)
    handler = _METRIC_HANDLERS[metric.id]
    columns, rows = handler(session, tenant_id, visible_ids, selection, limit)

    truncated = len(rows) > limit
    if truncated:
        rows = rows[:limit]

    interpretation = _build_interpretation(metric, selection)
    return SemanticQueryResult(
        metric=metric.id,
        columns=columns,
        rows=rows,
        row_count=len(rows),
        truncated=truncated,
        interpretation=interpretation,
    )


def _resolve_metric(metric_id: str, role: str) -> MetricDefinition:
    metric = catalog.get_metric(metric_id)
    if metric is None:
        raise AppException(f"Unknown governed metric: {metric_id}")
    if role not in metric.allowed_roles:
        raise AppException(f"Metric '{metric_id}' is not available for role '{role}'.")
    return metric


def _validate_selection(metric: MetricDefinition, selection: SemanticSelection) -> None:
    if selection.limit < 1:
        raise AppException("limit must be at least 1.")
    for dimension in selection.dimensions:
        if dimension not in metric.allowed_dimensions:
            raise AppException(f"Dimension '{dimension}' is not allowed for metric '{metric.id}'.")
    for filter_key in selection.filters:
        if filter_key not in metric.allowed_filters:
            raise AppException(f"Filter '{filter_key}' is not allowed for metric '{metric.id}'.")
    if len(selection.dimensions) != len(set(selection.dimensions)):
        raise AppException("Duplicate dimensions are not allowed.")


def _empty_result(
    metric: MetricDefinition,
    selection: SemanticSelection,
    visible_ids: set[UUID] | None,
) -> SemanticQueryResult:
    _ = visible_ids
    columns = _result_columns(metric, selection)
    return SemanticQueryResult(
        metric=metric.id,
        columns=columns,
        rows=[],
        row_count=0,
        truncated=False,
        interpretation=_build_interpretation(metric, selection),
    )


def _result_columns(metric: MetricDefinition, selection: SemanticSelection) -> list[str]:
    cols = list(selection.dimensions)
    cols.append("value")
    return cols


def _build_interpretation(metric: MetricDefinition, selection: SemanticSelection) -> str:
    parts = [f"metric={metric.id}"]
    if selection.dimensions:
        parts.append(f"group_by={','.join(selection.dimensions)}")
    if selection.filters:
        filter_text = ",".join(f"{key}={value}" for key, value in sorted(selection.filters.items()))
        parts.append(f"filters={filter_text}")
    return "; ".join(parts)


def _apply_student_filters(query, filters: dict[str, str]):
    if catalog.DIMENSION_DEPARTMENT in filters:
        query = query.where(Department.code == filters[catalog.DIMENSION_DEPARTMENT])
    if catalog.DIMENSION_PROGRAMME in filters:
        query = query.where(Programme.code == filters[catalog.DIMENSION_PROGRAMME])
    return query


def _department_label():
    return func.coalesce(Department.code, _UNASSIGNED_DEPARTMENT).label(catalog.DIMENSION_DEPARTMENT)


def _group_labels(selection: SemanticSelection) -> list[Any]:
    labels: list[Any] = []
    for dimension in selection.dimensions:
        if dimension == catalog.DIMENSION_DEPARTMENT:
            labels.append(_department_label())
        elif dimension == catalog.DIMENSION_PROGRAMME:
            labels.append(Programme.code.label(catalog.DIMENSION_PROGRAMME))
        elif dimension == catalog.DIMENSION_TIER:
            labels.append(RiskAssessment.tier.label(catalog.DIMENSION_TIER))
        elif dimension == catalog.DIMENSION_RISK_TYPE:
            labels.append(RiskFinding.risk_type.label(catalog.DIMENSION_RISK_TYPE))
    return labels


def _rows_from_result(
    metric: MetricDefinition,
    selection: SemanticSelection,
    result_rows: Sequence[tuple],
) -> tuple[list[str], list[dict[str, Any]]]:
    columns = _result_columns(metric, selection)
    rows: list[dict[str, Any]] = []
    for raw in result_rows:
        row: dict[str, Any] = {}
        for index, column in enumerate(columns[:-1]):
            row[column] = raw[index]
        value = raw[len(columns) - 1]
        if metric.value_type == "integer":
            row["value"] = int(value or 0)
        elif metric.value_type == "percentage":
            row["value"] = round(float(value or 0.0), 2)
        else:
            row["value"] = round(float(value or 0.0), 2)
        rows.append(row)
    return columns, rows


def _exec_student_count(
    session: Session,
    tenant_id: UUID,
    visible_ids: set[UUID] | None,
    selection: SemanticSelection,
    limit: int,
) -> tuple[list[str], list[dict[str, Any]]]:
    metric = catalog.METRICS["student_count"]
    if selection.dimensions:
        labels = _group_labels(selection)
        query = (
            select(*labels, func.count(Student.id))
            .select_from(Student)
            .outerjoin(Programme, Programme.id == Student.programme_id)
            .outerjoin(Department, Department.id == Programme.department_id)
            .where(Student.tenant_id == tenant_id, Student.is_deleted.is_(False))
        )
        if visible_ids is not None:
            query = query.where(Student.id.in_(visible_ids))
        query = _apply_student_filters(query, selection.filters)
        query = query.group_by(*labels).order_by(*labels).limit(limit)
        return _rows_from_result(metric, selection, session.execute(query).all())

    query = select(func.count(Student.id)).select_from(Student)
    query = query.where(Student.tenant_id == tenant_id, Student.is_deleted.is_(False))
    if visible_ids is not None:
        query = query.where(Student.id.in_(visible_ids))
    query = _apply_student_filters(query, selection.filters)
    count = session.execute(query).scalar_one()
    return _rows_from_result(metric, selection, [(count,)])


def _exec_assessed_student_count(
    session: Session,
    tenant_id: UUID,
    visible_ids: set[UUID] | None,
    selection: SemanticSelection,
    limit: int,
) -> tuple[list[str], list[dict[str, Any]]]:
    metric = catalog.METRICS["assessed_student_count"]
    labels = _group_labels(selection)
    if labels:
        query = (
            select(*labels, func.count(RiskAssessment.id))
            .select_from(RiskAssessment)
            .join(Student, Student.id == RiskAssessment.student_id)
            .outerjoin(Programme, Programme.id == Student.programme_id)
            .outerjoin(Department, Department.id == Programme.department_id)
            .where(
                RiskAssessment.tenant_id == tenant_id,
                RiskAssessment.is_current.is_(True),
                Student.is_deleted.is_(False),
            )
        )
        if visible_ids is not None:
            query = query.where(RiskAssessment.student_id.in_(visible_ids))
        if catalog.DIMENSION_TIER in selection.filters:
            query = query.where(RiskAssessment.tier == selection.filters[catalog.DIMENSION_TIER])
        if catalog.DIMENSION_DEPARTMENT in selection.filters:
            query = query.where(Department.code == selection.filters[catalog.DIMENSION_DEPARTMENT])
        query = query.group_by(*labels).order_by(*labels).limit(limit)
        return _rows_from_result(metric, selection, session.execute(query).all())

    count_query = (
        select(func.count(RiskAssessment.id))
        .select_from(RiskAssessment)
        .join(Student, Student.id == RiskAssessment.student_id)
        .outerjoin(Programme, Programme.id == Student.programme_id)
        .outerjoin(Department, Department.id == Programme.department_id)
        .where(
            RiskAssessment.tenant_id == tenant_id,
            RiskAssessment.is_current.is_(True),
            Student.is_deleted.is_(False),
        )
    )
    if visible_ids is not None:
        count_query = count_query.where(RiskAssessment.student_id.in_(visible_ids))
    if catalog.DIMENSION_TIER in selection.filters:
        count_query = count_query.where(RiskAssessment.tier == selection.filters[catalog.DIMENSION_TIER])
    if catalog.DIMENSION_DEPARTMENT in selection.filters:
        count_query = count_query.where(Department.code == selection.filters[catalog.DIMENSION_DEPARTMENT])
    count = session.execute(count_query).scalar_one()
    return _rows_from_result(metric, selection, [(count,)])


def _exec_risk_tier_count(
    session: Session,
    tenant_id: UUID,
    visible_ids: set[UUID] | None,
    selection: SemanticSelection,
    limit: int,
) -> tuple[list[str], list[dict[str, Any]]]:
    metric = catalog.METRICS["risk_tier_count"]
    if catalog.DIMENSION_TIER not in selection.dimensions:
        selection = SemanticSelection(
            metric=selection.metric,
            dimensions=[*selection.dimensions, catalog.DIMENSION_TIER],
            filters=selection.filters,
            limit=selection.limit,
        )
    labels = _group_labels(selection)
    query = (
        select(*labels, func.count(RiskAssessment.id))
        .select_from(RiskAssessment)
        .join(Student, Student.id == RiskAssessment.student_id)
        .outerjoin(Programme, Programme.id == Student.programme_id)
        .outerjoin(Department, Department.id == Programme.department_id)
        .where(
            RiskAssessment.tenant_id == tenant_id,
            RiskAssessment.is_current.is_(True),
            Student.is_deleted.is_(False),
        )
    )
    if visible_ids is not None:
        query = query.where(RiskAssessment.student_id.in_(visible_ids))
    if catalog.DIMENSION_TIER in selection.filters:
        query = query.where(RiskAssessment.tier == selection.filters[catalog.DIMENSION_TIER])
    if catalog.DIMENSION_DEPARTMENT in selection.filters:
        query = query.where(Department.code == selection.filters[catalog.DIMENSION_DEPARTMENT])
    query = query.group_by(*labels).order_by(*labels).limit(limit)
    return _rows_from_result(metric, selection, session.execute(query).all())


def _exec_avg_risk_score(
    session: Session,
    tenant_id: UUID,
    visible_ids: set[UUID] | None,
    selection: SemanticSelection,
    limit: int,
) -> tuple[list[str], list[dict[str, Any]]]:
    metric = catalog.METRICS["avg_risk_score"]
    labels = _group_labels(selection)
    query = (
        select(*labels, func.avg(RiskAssessment.overall_score))
        .select_from(RiskAssessment)
        .join(Student, Student.id == RiskAssessment.student_id)
        .outerjoin(Programme, Programme.id == Student.programme_id)
        .outerjoin(Department, Department.id == Programme.department_id)
        .where(
            RiskAssessment.tenant_id == tenant_id,
            RiskAssessment.is_current.is_(True),
            Student.is_deleted.is_(False),
        )
    )
    if visible_ids is not None:
        query = query.where(RiskAssessment.student_id.in_(visible_ids))
    if catalog.DIMENSION_TIER in selection.filters:
        query = query.where(RiskAssessment.tier == selection.filters[catalog.DIMENSION_TIER])
    if catalog.DIMENSION_DEPARTMENT in selection.filters:
        query = query.where(Department.code == selection.filters[catalog.DIMENSION_DEPARTMENT])
    if labels:
        query = query.group_by(*labels).order_by(*labels).limit(limit)
        return _rows_from_result(metric, selection, session.execute(query).all())
    avg_query = (
        select(func.avg(RiskAssessment.overall_score))
        .select_from(RiskAssessment)
        .join(Student, Student.id == RiskAssessment.student_id)
        .outerjoin(Programme, Programme.id == Student.programme_id)
        .outerjoin(Department, Department.id == Programme.department_id)
        .where(
            RiskAssessment.tenant_id == tenant_id,
            RiskAssessment.is_current.is_(True),
            Student.is_deleted.is_(False),
        )
    )
    if visible_ids is not None:
        avg_query = avg_query.where(RiskAssessment.student_id.in_(visible_ids))
    if catalog.DIMENSION_TIER in selection.filters:
        avg_query = avg_query.where(RiskAssessment.tier == selection.filters[catalog.DIMENSION_TIER])
    if catalog.DIMENSION_DEPARTMENT in selection.filters:
        avg_query = avg_query.where(Department.code == selection.filters[catalog.DIMENSION_DEPARTMENT])
    avg = session.execute(avg_query).scalar_one()
    return _rows_from_result(metric, selection, [(avg,)])


def _exec_students_with_risk_type(
    session: Session,
    tenant_id: UUID,
    visible_ids: set[UUID] | None,
    selection: SemanticSelection,
    limit: int,
) -> tuple[list[str], list[dict[str, Any]]]:
    metric = catalog.METRICS["students_with_risk_type"]
    if catalog.DIMENSION_RISK_TYPE not in selection.dimensions:
        selection = SemanticSelection(
            metric=selection.metric,
            dimensions=[*selection.dimensions, catalog.DIMENSION_RISK_TYPE],
            filters=selection.filters,
            limit=selection.limit,
        )
    labels = _group_labels(selection)
    query = (
        select(*labels, func.count(func.distinct(RiskAssessment.student_id)))
        .select_from(RiskFinding)
        .join(RiskAssessment, RiskAssessment.id == RiskFinding.assessment_id)
        .join(Student, Student.id == RiskAssessment.student_id)
        .outerjoin(Programme, Programme.id == Student.programme_id)
        .outerjoin(Department, Department.id == Programme.department_id)
        .where(
            RiskFinding.tenant_id == tenant_id,
            RiskAssessment.tenant_id == tenant_id,
            RiskAssessment.is_current.is_(True),
            Student.is_deleted.is_(False),
        )
    )
    if visible_ids is not None:
        query = query.where(RiskAssessment.student_id.in_(visible_ids))
    if catalog.DIMENSION_RISK_TYPE in selection.filters:
        if selection.filters[catalog.DIMENSION_RISK_TYPE] not in RISK_TYPES:
            raise SemanticAbstentionError()
        query = query.where(RiskFinding.risk_type == selection.filters[catalog.DIMENSION_RISK_TYPE])
    if catalog.DIMENSION_DEPARTMENT in selection.filters:
        query = query.where(Department.code == selection.filters[catalog.DIMENSION_DEPARTMENT])
    query = query.group_by(*labels).order_by(*labels).limit(limit)
    return _rows_from_result(metric, selection, session.execute(query).all())


def _exec_attendance_present_rate(
    session: Session,
    tenant_id: UUID,
    visible_ids: set[UUID] | None,
    selection: SemanticSelection,
    limit: int,
) -> tuple[list[str], list[dict[str, Any]]]:
    metric = catalog.METRICS["attendance_present_rate"]
    present_case = func.sum(case((Attendance.status == "present", 1), else_=0))
    total_case = func.count(Attendance.id)
    rate = (present_case * 100.0 / func.nullif(total_case, 0))
    labels = _group_labels(selection)
    query = (
        select(*labels, rate)
        .select_from(Attendance)
        .join(Student, Student.id == Attendance.student_id)
        .outerjoin(Programme, Programme.id == Student.programme_id)
        .outerjoin(Department, Department.id == Programme.department_id)
        .where(Attendance.tenant_id == tenant_id, Student.is_deleted.is_(False), Attendance.is_deleted.is_(False))
    )
    if visible_ids is not None:
        query = query.where(Attendance.student_id.in_(visible_ids))
    query = _apply_student_filters(query, selection.filters)
    if labels:
        query = query.group_by(*labels).order_by(*labels).limit(limit)
        return _rows_from_result(metric, selection, session.execute(query).all())
    overall_query = (
        select(rate)
        .select_from(Attendance)
        .join(Student, Student.id == Attendance.student_id)
        .outerjoin(Programme, Programme.id == Student.programme_id)
        .outerjoin(Department, Department.id == Programme.department_id)
        .where(Attendance.tenant_id == tenant_id, Student.is_deleted.is_(False), Attendance.is_deleted.is_(False))
    )
    if visible_ids is not None:
        overall_query = overall_query.where(Attendance.student_id.in_(visible_ids))
    overall_query = _apply_student_filters(overall_query, selection.filters)
    overall = session.execute(overall_query).scalar_one()
    return _rows_from_result(metric, selection, [(overall,)])


def _exec_avg_internal_mark_pct(
    session: Session,
    tenant_id: UUID,
    visible_ids: set[UUID] | None,
    selection: SemanticSelection,
    limit: int,
) -> tuple[list[str], list[dict[str, Any]]]:
    metric = catalog.METRICS["avg_internal_mark_pct"]
    pct = func.avg(InternalMark.obtained * 100.0 / func.nullif(InternalMark.max_marks, 0))
    labels = _group_labels(selection)
    query = (
        select(*labels, pct)
        .select_from(InternalMark)
        .join(Student, Student.id == InternalMark.student_id)
        .outerjoin(Programme, Programme.id == Student.programme_id)
        .outerjoin(Department, Department.id == Programme.department_id)
        .where(
            InternalMark.tenant_id == tenant_id,
            Student.is_deleted.is_(False),
            InternalMark.is_deleted.is_(False),
        )
    )
    if visible_ids is not None:
        query = query.where(InternalMark.student_id.in_(visible_ids))
    query = _apply_student_filters(query, selection.filters)
    if labels:
        query = query.group_by(*labels).order_by(*labels).limit(limit)
        return _rows_from_result(metric, selection, session.execute(query).all())
    overall_query = (
        select(pct)
        .select_from(InternalMark)
        .join(Student, Student.id == InternalMark.student_id)
        .outerjoin(Programme, Programme.id == Student.programme_id)
        .outerjoin(Department, Department.id == Programme.department_id)
        .where(
            InternalMark.tenant_id == tenant_id,
            Student.is_deleted.is_(False),
            InternalMark.is_deleted.is_(False),
        )
    )
    if visible_ids is not None:
        overall_query = overall_query.where(InternalMark.student_id.in_(visible_ids))
    overall_query = _apply_student_filters(overall_query, selection.filters)
    overall = session.execute(overall_query).scalar_one()
    return _rows_from_result(metric, selection, [(overall,)])


_METRIC_HANDLERS = {
    "student_count": _exec_student_count,
    "assessed_student_count": _exec_assessed_student_count,
    "risk_tier_count": _exec_risk_tier_count,
    "avg_risk_score": _exec_avg_risk_score,
    "students_with_risk_type": _exec_students_with_risk_type,
    "attendance_present_rate": _exec_attendance_present_rate,
    "avg_internal_mark_pct": _exec_avg_internal_mark_pct,
}
