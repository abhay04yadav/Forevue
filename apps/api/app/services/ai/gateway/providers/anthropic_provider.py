"""Anthropic provider behind the AI Gateway (Ch3 §3)."""

import json
import logging
from typing import Any

import httpx

from app.services.ai.gateway.types import GatewayRequest, GatewayResponse, ToolCall
from app.services.ai.tools.registry import SEMANTIC_QUERY_TOOL

logger = logging.getLogger(__name__)


class AnthropicProvider:
    def __init__(self, *, api_key: str, model: str, timeout_seconds: float = 60.0) -> None:
        self._api_key = api_key
        self._model = model
        self._timeout = timeout_seconds

    def complete(self, request: GatewayRequest) -> GatewayResponse:
        system_parts: list[str] = []
        messages: list[dict[str, str]] = []
        for message in request.messages:
            if message.role == "system":
                system_parts.append(message.content)
            else:
                messages.append({"role": message.role, "content": message.content})

        payload: dict[str, Any] = {
            "model": self._model,
            "max_tokens": 1024,
            "system": "\n\n".join(system_parts) if system_parts else None,
            "messages": messages,
        }
        if request.task_type == "nl_intent" and request.tools:
            payload["tools"] = [
                {
                    "name": tool["function"]["name"],
                    "description": tool["function"].get("description", ""),
                    "input_schema": tool["function"].get("parameters", {"type": "object"}),
                }
                for tool in request.tools
                if tool.get("type") == "function"
            ]

        with httpx.Client(timeout=self._timeout) as client:
            response = client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self._api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={k: v for k, v in payload.items() if v is not None},
            )
            response.raise_for_status()
            data = response.json()

        tool_calls: list[ToolCall] = []
        text_parts: list[str] = []
        for block in data.get("content") or []:
            if block.get("type") == "text":
                text_parts.append(block.get("text") or "")
            elif block.get("type") == "tool_use" and block.get("name") == SEMANTIC_QUERY_TOOL:
                tool_calls.append(ToolCall(name=block["name"], arguments=dict(block.get("input") or {})))

        usage = data.get("usage") or {}
        return GatewayResponse(
            task_type=request.task_type,
            content="\n".join(text_parts) if text_parts else None,
            tool_calls=tool_calls,
            model_tier=f"anthropic:{self._model}",
            prompt_tokens=int(usage.get("input_tokens") or 0),
            completion_tokens=int(usage.get("output_tokens") or 0),
        )
