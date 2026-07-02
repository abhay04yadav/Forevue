from uuid import UUID

from sqlalchemy.orm import Session

from app.api.deps import CurrentUser
from app.core.exceptions import NotFoundException
from app.models.user import User
from app.services.risk.scoping import (
    SCOPE_RESOLVED_STAFF_ROLES,
    has_full_visibility,
    visible_student_ids,
)


def assert_student_self_scope(session: Session, current_user: CurrentUser, student_id: UUID) -> None:
    """Enforce read scope for student canonical routes (fail closed).

    - Students: own record only.
    - Faculty / HOD: same visible_student_ids set as /risk/* (out-of-scope → 404).
    - Privileged roles: tenant-wide read.
    - Others (e.g. placement): denied.
    """
    if current_user.role == "student":
        user = session.get(User, current_user.user_id)
        if user is None or user.student_id != student_id:
            raise NotFoundException("Student not found.")
        return

    if has_full_visibility(current_user.role):
        return

    if current_user.role in SCOPE_RESOLVED_STAFF_ROLES:
        visible = visible_student_ids(
            session, current_user.tenant_id, current_user.role, current_user.user_id
        )
        if student_id not in (visible or set()):
            raise NotFoundException("Student not found.")
        return

    raise NotFoundException("Student not found.")
