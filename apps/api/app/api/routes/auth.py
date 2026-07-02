from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, get_current_user, get_tenant_session
from app.core.db import get_session
from app.core.rate_limit import check_auth_rate_limit, check_auth_rate_limit_by_ip
from app.schemas.auth import LoginRequest, LogoutRequest, MeResponse, RefreshRequest, RegisterRequest, TokenResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(
    payload: RegisterRequest,
    request: Request,
    session: Session = Depends(get_session),
) -> TokenResponse:
    check_auth_rate_limit_by_ip(request, "register")
    return auth_service.register_tenant_and_admin(session, payload)


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    request: Request,
    session: Session = Depends(get_session),
) -> TokenResponse:
    check_auth_rate_limit(request, "login", f"{payload.tenant_slug}:{payload.email}")
    return auth_service.login(session, payload.tenant_slug, payload.email, payload.password)


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    payload: RefreshRequest,
    request: Request,
    session: Session = Depends(get_session),
) -> TokenResponse:
    check_auth_rate_limit_by_ip(request, "refresh")
    return auth_service.refresh(session, payload.refresh_token)


@router.post("/logout", status_code=204)
def logout(payload: LogoutRequest) -> None:
    auth_service.logout(payload.refresh_token)


@router.get("/me", response_model=MeResponse)
def me(
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_tenant_session),
) -> MeResponse:
    return auth_service.get_me(session, current_user)
