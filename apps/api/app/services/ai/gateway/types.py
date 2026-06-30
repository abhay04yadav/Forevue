"""AI Gateway request/response types (Ch3 §3, AI-3.1)."""

from dataclasses import dataclass, field
from typing import Any, Literal

TaskType = Literal["nl_intent", "narration"]


@dataclass
class GatewayMessage:
    role: Literal["system", "user", "assistant"]
    content: str


@dataclass
class GatewayRequest:
    tenant_id: str
    task_type: TaskType
    messages: list[GatewayMessage]
    tools: list[dict[str, Any]] = field(default_factory=list)


@dataclass
class ToolCall:
    name: str
    arguments: dict[str, Any]


@dataclass
class GatewayResponse:
    task_type: TaskType
    content: str | None = None
    tool_calls: list[ToolCall] = field(default_factory=list)
    model_tier: str = "stub"
    prompt_tokens: int = 0
    completion_tokens: int = 0
    cached: bool = False
