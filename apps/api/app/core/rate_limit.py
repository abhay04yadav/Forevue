"""Per-tenant auth endpoint rate limiting (Ch7 §10)."""

from __future__ import annotations

from fastapi import Request

from app.core.config import settings
from app.core.exceptions import RateLimitException
from app.core.kv import get_kv_store


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client is None:
        return "unknown"
    return request.client.host


def _rate_key(scope: str, identifier: str) -> str:
    return f"ratelimit:{scope}:{identifier}"


def check_auth_rate_limit(request: Request, scope: str, identifier: str) -> None:
    """Raises RateLimitException when the sliding window is exceeded."""
    if settings.auth_rate_limit_per_minute <= 0:
        return
    key = _rate_key(scope, identifier)
    count = get_kv_store().incr(key, ttl_seconds=60)
    if count > settings.auth_rate_limit_per_minute:
        raise RateLimitException(retry_after_seconds=60)


def check_auth_rate_limit_by_ip(request: Request, scope: str) -> None:
    check_auth_rate_limit(request, scope, _client_ip(request))
