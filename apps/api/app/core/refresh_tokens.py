"""Refresh-token rotation + revocation (Ch4 §2, Ch6 DATA-6.1, TDR-15).

Each refresh JWT carries `jti` and `family` claims. Only the current jti per
family is valid; rotation revokes the previous jti. Reuse of a revoked jti
revokes the whole family (stolen-token detection).
"""

from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from app.core.config import settings
from app.core.exceptions import UnauthorizedException
from app.core.kv import KVStore, get_kv_store


def _deny_key(jti: str) -> str:
    return f"revoked:jti:{jti}"


def _active_key(user_id: UUID, family: UUID) -> str:
    return f"refresh:active:{user_id}:{family}"


def _user_families_key(user_id: UUID) -> str:
    return f"refresh:families:{user_id}"


@dataclass(frozen=True)
class RefreshClaims:
    jti: UUID
    family: UUID


class RefreshTokenStore:
    def __init__(self, kv: KVStore) -> None:
        self._kv = kv

    def _ensure_available(self) -> None:
        if settings.redis_url and settings.redis_fail_closed and not self._kv.ping():
            raise UnauthorizedException("Authentication service temporarily unavailable.")

    def register(self, user_id: UUID, claims: RefreshClaims, ttl_seconds: int) -> None:
        self._ensure_available()
        self._kv.set(_active_key(user_id, claims.family), str(claims.jti), ttl_seconds)
        families = self._kv.get(_user_families_key(user_id))
        family_set = set(families.split(",")) if families else set()
        family_set.add(str(claims.family))
        self._kv.set(_user_families_key(user_id), ",".join(sorted(family_set)), ttl_seconds)

    def validate_and_rotate(
        self, user_id: UUID, presented: RefreshClaims, new_claims: RefreshClaims, ttl_seconds: int
    ) -> None:
        self._ensure_available()
        if self._kv.get(_deny_key(str(presented.jti))):
            self._revoke_family(user_id, presented.family, ttl_seconds)
            raise UnauthorizedException("Invalid or expired refresh token.")

        active = self._kv.get(_active_key(user_id, presented.family))
        if active is None:
            raise UnauthorizedException("Invalid or expired refresh token.")
        if active != str(presented.jti):
            self._revoke_family(user_id, presented.family, ttl_seconds)
            raise UnauthorizedException("Invalid or expired refresh token.")

        self._kv.set(_deny_key(str(presented.jti)), "1", ttl_seconds)
        self._kv.delete(_active_key(user_id, presented.family))
        self.register(user_id, new_claims, ttl_seconds)

    def revoke(self, user_id: UUID, claims: RefreshClaims, ttl_seconds: int) -> None:
        self._ensure_available()
        self._kv.set(_deny_key(str(claims.jti)), "1", ttl_seconds)
        active = self._kv.get(_active_key(user_id, claims.family))
        if active == str(claims.jti):
            self._kv.delete(_active_key(user_id, claims.family))

    def revoke_all_for_user(self, user_id: UUID, ttl_seconds: int) -> None:
        self._ensure_available()
        families = self._kv.get(_user_families_key(user_id))
        if not families:
            return
        for family_str in families.split(","):
            if not family_str:
                continue
            self._revoke_family(user_id, UUID(family_str), ttl_seconds)
        self._kv.delete(_user_families_key(user_id))

    def _revoke_family(self, user_id: UUID, family: UUID, ttl_seconds: int) -> None:
        active = self._kv.get(_active_key(user_id, family))
        if active:
            self._kv.set(_deny_key(active), "1", ttl_seconds)
        self._kv.delete(_active_key(user_id, family))


_store: RefreshTokenStore | None = None


def get_refresh_token_store() -> RefreshTokenStore:
    global _store
    if _store is None:
        _store = RefreshTokenStore(get_kv_store())
    return _store


def reset_refresh_token_store() -> None:
    global _store
    _store = None
