"""Ephemeral key-value store (Ch6 DATA-6.1).

Redis when REDIS_URL is configured; in-process memory otherwise (dev/tests).
Redis is never a system of record — only session-adjacent data (token denylist,
rate-limit counters).
"""

from __future__ import annotations

import time
from abc import ABC, abstractmethod
from collections.abc import Callable
from typing import TYPE_CHECKING

from app.core.config import settings

if TYPE_CHECKING:
    from redis import Redis


class KVStore(ABC):
    @abstractmethod
    def get(self, key: str) -> str | None: ...

    @abstractmethod
    def set(self, key: str, value: str, ttl_seconds: int) -> None: ...

    @abstractmethod
    def delete(self, key: str) -> None: ...

    @abstractmethod
    def incr(self, key: str, ttl_seconds: int) -> int: ...

    @abstractmethod
    def ping(self) -> bool: ...


class InMemoryKVStore(KVStore):
    def __init__(self) -> None:
        self._values: dict[str, str] = {}
        self._expires: dict[str, float] = {}

    def _purge_expired(self, key: str) -> None:
        exp = self._expires.get(key)
        if exp is not None and exp <= time.monotonic():
            self._values.pop(key, None)
            self._expires.pop(key, None)

    def get(self, key: str) -> str | None:
        self._purge_expired(key)
        return self._values.get(key)

    def set(self, key: str, value: str, ttl_seconds: int) -> None:
        self._values[key] = value
        if ttl_seconds > 0:
            self._expires[key] = time.monotonic() + ttl_seconds

    def delete(self, key: str) -> None:
        self._values.pop(key, None)
        self._expires.pop(key, None)

    def incr(self, key: str, ttl_seconds: int) -> int:
        self._purge_expired(key)
        current = int(self._values.get(key, "0")) + 1
        self._values[key] = str(current)
        if key not in self._expires and ttl_seconds > 0:
            self._expires[key] = time.monotonic() + ttl_seconds
        return current

    def ping(self) -> bool:
        return True

    def clear(self) -> None:
        self._values.clear()
        self._expires.clear()


class RedisKVStore(KVStore):
    def __init__(self, client: Redis) -> None:
        self._client = client

    def get(self, key: str) -> str | None:
        value = self._client.get(key)
        if value is None:
            return None
        return value.decode() if isinstance(value, bytes) else str(value)

    def set(self, key: str, value: str, ttl_seconds: int) -> None:
        if ttl_seconds > 0:
            self._client.setex(key, ttl_seconds, value)
        else:
            self._client.set(key, value)

    def delete(self, key: str) -> None:
        self._client.delete(key)

    def incr(self, key: str, ttl_seconds: int) -> int:
        count = int(self._client.incr(key))
        if count == 1 and ttl_seconds > 0:
            self._client.expire(key, ttl_seconds)
        return count

    def ping(self) -> bool:
        return bool(self._client.ping())


_store: KVStore | None = None


def get_kv_store() -> KVStore:
    global _store
    if _store is not None:
        return _store
    if settings.redis_url:
        import redis

        client = redis.from_url(settings.redis_url, decode_responses=False)
        client.ping()
        _store = RedisKVStore(client)
    else:
        _store = InMemoryKVStore()
    return _store


def reset_kv_store_for_tests(factory: Callable[[], KVStore] | None = None) -> None:
    """Test hook: replace the process-wide store (always in-memory in pytest)."""
    global _store
    if factory is None:
        _store = InMemoryKVStore()
    else:
        _store = factory()
