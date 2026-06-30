"""Bounded session memory for multi-turn coherence (Ch3 §7, AI-7.1)."""

import json
import uuid
from dataclasses import dataclass
from uuid import UUID

from app.core.config import settings
from app.core.kv import get_kv_store
from app.services.ai.monitoring import get_ai_metrics


@dataclass
class MemoryTurn:
    role: str
    content: str


class SessionMemoryStore:
    def __init__(self) -> None:
        self._kv = get_kv_store()

    def _key(self, tenant_id: UUID, user_id: UUID, session_id: str) -> str:
        return f"ai:memory:{tenant_id}:{user_id}:{session_id}"

    def ensure_session_id(self, session_id: str | None) -> str:
        return session_id or str(uuid.uuid4())

    def load(self, *, tenant_id: UUID, user_id: UUID, session_id: str) -> list[MemoryTurn]:
        raw = self._kv.get(self._key(tenant_id, user_id, session_id))
        if not raw:
            return []
        get_ai_metrics().record_session_memory_read()
        data = json.loads(raw)
        turns = [MemoryTurn(role=item["role"], content=item["content"]) for item in data]
        return turns[-settings.ai_session_memory_max_turns :]

    def append(
        self,
        *,
        tenant_id: UUID,
        user_id: UUID,
        session_id: str,
        question: str,
        answer_summary: str,
    ) -> None:
        turns = self.load(tenant_id=tenant_id, user_id=user_id, session_id=session_id)
        turns.extend(
            [
                MemoryTurn(role="user", content=question),
                MemoryTurn(role="assistant", content=answer_summary),
            ]
        )
        turns = turns[-settings.ai_session_memory_max_turns :]
        payload = json.dumps([{"role": t.role, "content": t.content} for t in turns])
        self._kv.set(
            self._key(tenant_id, user_id, session_id),
            payload,
            settings.ai_session_memory_ttl_seconds,
        )
        get_ai_metrics().record_session_memory_write()
