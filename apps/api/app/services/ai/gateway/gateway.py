"""AI Gateway — single chokepoint for model access (Ch3 §3, AI-3.1)."""

import hashlib
import json
import logging
import time
from typing import Any

from app.core.config import settings
from app.core.kv import get_kv_store
from app.services.ai.gateway.providers.factory import get_llm_provider
from app.services.ai.gateway.types import GatewayRequest, GatewayResponse
from app.services.ai.monitoring import get_ai_metrics

logger = logging.getLogger(__name__)

_CACHE_TTL_SECONDS = 300


class AIGateway:
    def __init__(self) -> None:
        self._provider = get_llm_provider()

    def complete(self, request: GatewayRequest) -> GatewayResponse:
        started = time.perf_counter()
        cache_key = self._cache_key(request)
        if settings.ai_gateway_cache_enabled:
            cached = self._read_cache(request.tenant_id, cache_key)
            if cached is not None:
                get_ai_metrics().record_gateway_call(cached=True)
                logger.info(
                    "ai_gateway_cache_hit tenant_id=%s task_type=%s model_tier=%s latency_ms=%.1f",
                    request.tenant_id,
                    request.task_type,
                    cached.model_tier,
                    (time.perf_counter() - started) * 1000,
                )
                cached.cached = True
                return cached

        response = self._provider.complete(request)
        if settings.ai_gateway_cache_enabled:
            self._write_cache(request.tenant_id, cache_key, response)
        latency_ms = (time.perf_counter() - started) * 1000
        get_ai_metrics().record_gateway_call(cached=False)
        logger.info(
            "ai_gateway_call tenant_id=%s task_type=%s model_tier=%s prompt_tokens=%s completion_tokens=%s latency_ms=%.1f",
            request.tenant_id,
            request.task_type,
            response.model_tier,
            response.prompt_tokens,
            response.completion_tokens,
            latency_ms,
        )
        return response

    def _cache_key(self, request: GatewayRequest) -> str:
        payload = {
            "task_type": request.task_type,
            "messages": [(m.role, m.content) for m in request.messages],
            "tools": request.tools,
        }
        digest = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
        return f"ai:gateway:{digest}"

    def _read_cache(self, tenant_id: str, cache_key: str) -> GatewayResponse | None:
        store = get_kv_store()
        raw = store.get(f"{tenant_id}:{cache_key}")
        if raw is None:
            return None
        data: dict[str, Any] = json.loads(raw)
        from app.services.ai.gateway.types import ToolCall

        return GatewayResponse(
            task_type=data["task_type"],
            content=data.get("content"),
            tool_calls=[ToolCall(**tc) for tc in data.get("tool_calls", [])],
            model_tier=data.get("model_tier", "stub"),
            prompt_tokens=data.get("prompt_tokens", 0),
            completion_tokens=data.get("completion_tokens", 0),
        )

    def _write_cache(self, tenant_id: str, cache_key: str, response: GatewayResponse) -> None:
        store = get_kv_store()
        payload = {
            "task_type": response.task_type,
            "content": response.content,
            "tool_calls": [{"name": tc.name, "arguments": tc.arguments} for tc in response.tool_calls],
            "model_tier": response.model_tier,
            "prompt_tokens": response.prompt_tokens,
            "completion_tokens": response.completion_tokens,
        }
        store.set(f"{tenant_id}:{cache_key}", json.dumps(payload), _CACHE_TTL_SECONDS)


gateway = AIGateway()
