"""Tenant user provisioning and faculty scope management (Ch4 §8)."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, get_current_user, get_tenant_session
from app.schemas.users import (
    FacultyScopeCreateRequest,
    FacultyScopeResponse,
    UserCreateRequest,
    UserResponse,
    UserUpdateRequest,
)
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
def list_users(
    session: Session = Depends(get_tenant_session),
    current_user: CurrentUser = Depends(get_current_user),
) -> list[UserResponse]:
    users = user_service.list_users(session, current_user.tenant_id, current_user.role)
    return [UserResponse.model_validate(u) for u in users]


@router.post("", response_model=UserResponse)
def create_user(
    payload: UserCreateRequest,
    session: Session = Depends(get_tenant_session),
    current_user: CurrentUser = Depends(get_current_user),
) -> UserResponse:
    user = user_service.create_user(session, current_user.tenant_id, current_user.role, payload)
    session.flush()
    return UserResponse.model_validate(user)


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    payload: UserUpdateRequest,
    session: Session = Depends(get_tenant_session),
    current_user: CurrentUser = Depends(get_current_user),
) -> UserResponse:
    user = user_service.update_user(
        session, current_user.tenant_id, current_user.role, current_user.user_id, user_id, payload
    )
    return UserResponse.model_validate(user)


@router.get("/{user_id}/scopes", response_model=list[FacultyScopeResponse])
def list_faculty_scopes(
    user_id: UUID,
    session: Session = Depends(get_tenant_session),
    current_user: CurrentUser = Depends(get_current_user),
) -> list[FacultyScopeResponse]:
    scopes = user_service.list_faculty_scopes(session, current_user.tenant_id, current_user.role, user_id)
    return [FacultyScopeResponse.model_validate(s) for s in scopes]


@router.post("/{user_id}/scopes", response_model=FacultyScopeResponse)
def add_faculty_scope(
    user_id: UUID,
    payload: FacultyScopeCreateRequest,
    session: Session = Depends(get_tenant_session),
    current_user: CurrentUser = Depends(get_current_user),
) -> FacultyScopeResponse:
    scope = user_service.add_faculty_scope(
        session, current_user.tenant_id, current_user.role, current_user.user_id, user_id, payload
    )
    session.flush()
    return FacultyScopeResponse.model_validate(scope)


@router.delete("/{user_id}/scopes/{scope_id}", status_code=204)
def remove_faculty_scope(
    user_id: UUID,
    scope_id: UUID,
    session: Session = Depends(get_tenant_session),
    current_user: CurrentUser = Depends(get_current_user),
) -> None:
    user_service.remove_faculty_scope(session, current_user.tenant_id, current_user.role, user_id, scope_id)
