from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from app.core.config import settings
from app.core.refresh_tokens import RefreshClaims

_password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return _password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _password_hasher.verify(password_hash, password)
    except VerifyMismatchError:
        return False


def _create_token(
    user_id: UUID,
    tenant_id: UUID,
    role: str,
    expires_delta: timedelta,
    token_type: str,
    *,
    jti: UUID | None = None,
    family: UUID | None = None,
) -> str:
    expire = datetime.now(UTC) + expires_delta
    payload: dict[str, str | int] = {
        "sub": str(user_id),
        "tenant_id": str(tenant_id),
        "role": role,
        "exp": expire,
        "type": token_type,
    }
    if token_type == "refresh":
        payload["jti"] = str(jti or uuid4())
        payload["family"] = str(family or uuid4())
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_access_token(user_id: UUID, tenant_id: UUID, role: str) -> str:
    delta = timedelta(minutes=settings.jwt_access_token_expire_minutes)
    return _create_token(user_id, tenant_id, role, delta, "access")


def create_refresh_token(
    user_id: UUID, tenant_id: UUID, role: str, *, family: UUID | None = None
) -> tuple[str, RefreshClaims]:
    jti = uuid4()
    family_id = family or uuid4()
    delta = timedelta(days=settings.jwt_refresh_token_expire_days)
    token = _create_token(user_id, tenant_id, role, delta, "refresh", jti=jti, family=family_id)
    return token, RefreshClaims(jti=jti, family=family_id)


def refresh_token_ttl_seconds() -> int:
    return settings.jwt_refresh_token_expire_days * 24 * 60 * 60


def parse_refresh_claims(payload: dict) -> RefreshClaims:
    return RefreshClaims(jti=UUID(payload["jti"]), family=UUID(payload["family"]))


def decode_token(token: str) -> dict:
    """Raises jwt.PyJWTError (expired/invalid) — caller maps to UnauthorizedException."""
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
