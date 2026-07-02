from uuid import UUID

import jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictException, UnauthorizedException
from app.core.refresh_tokens import get_refresh_token_store
from app.core.rls import set_tenant_context
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    parse_refresh_claims,
    refresh_token_ttl_seconds,
    verify_password,
)
from app.models.tenant import Tenant
from app.models.user import User
from app.models.risk import FacultyScope
from app.repositories.tenant_repository import TenantRepository
from app.api.deps import CurrentUser
from app.repositories.user_repository import UserRepository
from app.schemas.auth import MeResponse, RegisterRequest, TokenResponse


def _issue_tokens(user: User) -> TokenResponse:
    refresh_token, claims = create_refresh_token(user.id, user.tenant_id, user.role)
    get_refresh_token_store().register(user.id, claims, refresh_token_ttl_seconds())
    return TokenResponse(
        access_token=create_access_token(user.id, user.tenant_id, user.role),
        refresh_token=refresh_token,
    )


def register_tenant_and_admin(session: Session, payload: RegisterRequest) -> TokenResponse:
    tenant_repo = TenantRepository(session)
    if tenant_repo.get_by_slug(payload.tenant_slug) is not None:
        raise ConflictException("A tenant with this slug already exists.")

    tenant = tenant_repo.add(Tenant(name=payload.tenant_name, slug=payload.tenant_slug))
    session.flush()

    set_tenant_context(session, tenant.id)
    user = User(
        tenant_id=tenant.id,
        email=payload.admin_email,
        password_hash=hash_password(payload.admin_password),
        role="admin",
    )
    session.add(user)
    session.flush()

    return _issue_tokens(user)


def login(session: Session, tenant_slug: str, email: str, password: str) -> TokenResponse:
    tenant = TenantRepository(session).get_by_slug(tenant_slug)
    if tenant is None or not tenant.is_active:
        raise UnauthorizedException("Invalid credentials.")

    set_tenant_context(session, tenant.id)
    user = UserRepository(session, tenant.id).get_by_email(email)
    if user is None or not user.is_active or not verify_password(password, user.password_hash):
        raise UnauthorizedException("Invalid credentials.")

    return _issue_tokens(user)


def refresh(session: Session, refresh_token: str) -> TokenResponse:
    try:
        payload = decode_token(refresh_token)
    except jwt.PyJWTError as exc:
        raise UnauthorizedException("Invalid or expired refresh token.") from exc
    if payload.get("type") != "refresh":
        raise UnauthorizedException("Invalid token type.")

    tenant_id = UUID(payload["tenant_id"])
    set_tenant_context(session, tenant_id)
    user = UserRepository(session, tenant_id).get(UUID(payload["sub"]))
    if user is None or not user.is_active:
        raise UnauthorizedException("User no longer active.")

    presented = parse_refresh_claims(payload)
    new_refresh, new_claims = create_refresh_token(user.id, user.tenant_id, user.role, family=presented.family)
    get_refresh_token_store().validate_and_rotate(user.id, presented, new_claims, refresh_token_ttl_seconds())

    return TokenResponse(
        access_token=create_access_token(user.id, user.tenant_id, user.role),
        refresh_token=new_refresh,
    )


def logout(refresh_token: str) -> None:
    try:
        payload = decode_token(refresh_token)
    except jwt.PyJWTError as exc:
        raise UnauthorizedException("Invalid or expired refresh token.") from exc
    if payload.get("type") != "refresh":
        raise UnauthorizedException("Invalid token type.")

    claims = parse_refresh_claims(payload)
    get_refresh_token_store().revoke(
        UUID(payload["sub"]),
        claims,
        refresh_token_ttl_seconds(),
    )


def revoke_user_sessions(user_id: UUID) -> None:
    get_refresh_token_store().revoke_all_for_user(user_id, refresh_token_ttl_seconds())


def get_me(session: Session, current_user: CurrentUser) -> MeResponse:
    user = UserRepository(session, current_user.tenant_id).get(current_user.user_id)
    if user is None:
        raise UnauthorizedException("User not found.")
    department_codes: list[str] = []
    if user.role in ("faculty", "hod"):
        department_codes = list(
            session.execute(
                select(FacultyScope.scope_ref).where(
                    FacultyScope.tenant_id == user.tenant_id,
                    FacultyScope.user_id == user.id,
                    FacultyScope.scope_type == "department",
                )
            )
            .scalars()
            .all()
        )
    return MeResponse(
        user_id=user.id,
        tenant_id=user.tenant_id,
        email=user.email,
        role=user.role,
        student_id=user.student_id,
        department_codes=department_codes,
    )
