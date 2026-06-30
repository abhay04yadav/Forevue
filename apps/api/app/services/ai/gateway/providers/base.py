"""LLM provider interface (Ch3 §3)."""

from typing import Protocol

from app.services.ai.gateway.types import GatewayRequest, GatewayResponse


class LLMProvider(Protocol):
    def complete(self, request: GatewayRequest) -> GatewayResponse: ...
