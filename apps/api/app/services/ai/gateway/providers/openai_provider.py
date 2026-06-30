"""OpenAI provider behind the AI Gateway (Ch3 §3)."""

import json
import logging
from typing import Any

import httpx

from app.services.ai.gateway.types import GatewayRequest, GatewayResponse, ToolCall
from app.services.ai.tools.registry import SEMANTIC_QUERY_TOOL

logger = logging.getLogger(__name__)


class OpenAIProvider:
    def __init__(
        self,
        *,
        api_key: str,
        model: str,
        intent_model: str | None = None,
        narration_model: str | None = None,
        timeout_seconds: float = 60.0,
    ) -> None:
        self._api_key = api_key
        self._default_model = model
        self._intent_model = intent_model or model
        self._narration_model = narration_model or model
        self._timeout = timeout_seconds

    def complete(self, request: GatewayRequest) -> GatewayResponse:
        model = self._intent_model if request.task_type == "nl_intent" else self._narration_model
        payload: dict[str, Any] = {
            "model": model,
            "messages": [{"role": m.role, "content": m.content} for m in request.messages],
        }
        if request.task_type == "nl_intent" and request.tools:
            payload["tools"] = request.tools
            payload["tool_choice"] = "auto"

        with httpx.Client(timeout=self._timeout) as client:
            response = client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {self._api_key}"},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

        choice = data["choices"][0]["message"]
        tool_calls: list[ToolCall] = []
        for raw in choice.get("tool_calls") or []:
            if raw.get("type") != "function":
                continue
            fn = raw["function"]
            if fn.get("name") != SEMANTIC_QUERY_TOOL:
                continue
            try:
                arguments = json.loads(fn.get("arguments") or "{}")
            except json.JSONDecodeError:
                arguments = {}
            tool_calls.append(ToolCall(name=fn["name"], arguments=arguments))

        usage = data.get("usage") or {}
        return GatewayResponse(
            task_type=request.task_type,
            content=choice.get("content"),
            tool_calls=tool_calls,
            model_tier=f"openai:{model}",
            prompt_tokens=int(usage.get("prompt_tokens") or 0),
            completion_tokens=int(usage.get("completion_tokens") or 0),
        )
