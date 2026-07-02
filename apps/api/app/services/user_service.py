from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictException, ForbiddenException, NotFoundException
from app.core.security import hash_password
from app.models.risk import FACULTY_SCOPE_TYPES, FacultyScope
from app.models.user import VALID_ROLES, User
from app.repositories.faculty_scope_repository import FacultyScopeRepository
from app.repositories.user_repository import UserRepository
from app.schemas.users import FacultyScopeCreateRequest, UserCreateRequest, UserUpdateRequest
from app.services import auth_service


def _ensure_admin(role: str) -> None:
    if role != "admin":
        raise ForbiddenException("Admin role required.")


def list_users(session: Session, tenant_id: UUID, actor_role: str) -> list[User]:
    _ensure_admin(actor_role)
    return UserRepository(session, tenant_id).list()


def create_user(session: Session, tenant_id: UUID, actor_role: str, payload: UserCreateRequest) -> User:
    _ensure_admin(actor_role)
    if payload.role not in VALID_ROLES:
        raise ConflictException(f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}")
    repo = UserRepository(session, tenant_id)
    if repo.get_by_email(payload.email) is not None:
        raise ConflictException("A user with this email already exists in this tenant.")
    user = User(
        tenant_id=tenant_id,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    return repo.add(user)


def update_user(
    session: Session, tenant_id: UUID, actor_role: str, actor_user_id: UUID, user_id: UUID, payload: UserUpdateRequest
) -> User:
    _ensure_admin(actor_role)
    repo = UserRepository(session, tenant_id)
    user = repo.get(user_id)
    if user is None:
        raise NotFoundException("User not found.")
    if user_id == actor_user_id and payload.is_active is False:
        raise ConflictException("You cannot deactivate your own account.")

    previous_role = user.role
    if payload.role is not None:
        if payload.role not in VALID_ROLES:
            raise ConflictException(f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}")
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active

    role_changed = payload.role is not None and payload.role != previous_role
    if payload.is_active is False or role_changed:
        auth_service.revoke_user_sessions(user.id)
    return user


def list_faculty_scopes(session: Session, tenant_id: UUID, actor_role: str, user_id: UUID) -> list[FacultyScope]:
    _ensure_admin(actor_role)
    user = UserRepository(session, tenant_id).get(user_id)
    if user is None:
        raise NotFoundException("User not found.")
    return FacultyScopeRepository(session, tenant_id).list_for_user(user_id)


def add_faculty_scope(
    session: Session,
    tenant_id: UUID,
    actor_role: str,
    actor_user_id: UUID,
    user_id: UUID,
    payload: FacultyScopeCreateRequest,
) -> FacultyScope:
    _ensure_admin(actor_role)
    user = UserRepository(session, tenant_id).get(user_id)
    if user is None:
        raise NotFoundException("User not found.")
    if user.role not in ("faculty", "hod"):
        raise ConflictException("Faculty scopes can only be assigned to faculty or HOD users.")
    if payload.scope_type not in FACULTY_SCOPE_TYPES:
        raise ConflictException(f"Invalid scope_type. Must be one of: {', '.join(FACULTY_SCOPE_TYPES)}")
    repo = FacultyScopeRepository(session, tenant_id)
    if repo.find_duplicate(user_id, payload.scope_type, payload.scope_ref) is not None:
        raise ConflictException("This scope is already assigned to the user.")
    return repo.add(
        FacultyScope(
            tenant_id=tenant_id,
            user_id=user_id,
            scope_type=payload.scope_type,
            scope_ref=payload.scope_ref,
            created_by=actor_user_id,
        )
    )


def remove_faculty_scope(session: Session, tenant_id: UUID, actor_role: str, user_id: UUID, scope_id: UUID) -> None:
    _ensure_admin(actor_role)
    user = UserRepository(session, tenant_id).get(user_id)
    if user is None:
        raise NotFoundException("User not found.")
    scope = FacultyScopeRepository(session, tenant_id).get_for_user(user_id, scope_id)
    if scope is None:
        raise NotFoundException("Scope not found.")
    session.delete(scope)
