"""Stub LLM provider for local dev and tests (Ch3 §3).

Returns deterministic tool calls from keyword rules until a real provider is
wired behind the same Gateway interface.
"""

import json
import re
from typing import Any

from app.services.ai.gateway.types import GatewayRequest, GatewayResponse, ToolCall
from app.services.ai.semantic import catalog


def _last_user_message(request: GatewayRequest) -> str:
    for message in reversed(request.messages):
        if message.role == "user":
            return message.content
    return ""


def _parse_tool_arguments(raw: dict[str, Any]) -> dict[str, Any]:
    return {
        "metric": raw.get("metric", ""),
        "dimensions": list(raw.get("dimensions") or []),
        "filters": dict(raw.get("filters") or {}),
        "limit": int(raw.get("limit") or 100),
    }


class StubProvider:
    """Keyword-based intent mapping — not a model; exercises the tool path."""

    def complete(self, request: GatewayRequest) -> GatewayResponse:
        if request.task_type == "narration":
            return GatewayResponse(
                task_type="narration",
                content=_narrate(_last_user_message(request)),
                model_tier="stub-narration",
                prompt_tokens=50,
                completion_tokens=25,
            )

        question = _last_user_message(request).lower()
        selection = _map_question_to_selection(question)
        if selection is None:
            return GatewayResponse(
                task_type="nl_intent",
                content="I can't answer that from your data.",
                model_tier="stub-intent",
                prompt_tokens=80,
                completion_tokens=10,
            )
        return GatewayResponse(
            task_type="nl_intent",
            tool_calls=[
                ToolCall(
                    name="query_semantic_metric",
                    arguments=_parse_tool_arguments(selection),
                )
            ],
            model_tier="stub-intent",
            prompt_tokens=120,
            completion_tokens=30,
        )


def _map_question_to_selection(question: str) -> dict[str, Any] | None:
    if not question.strip():
        return None

    filters: dict[str, str] = {}
    dimensions: list[str] = []

    dept_match = re.search(r"\b(?:department|dept)\s+([a-z0-9_-]+)", question)
    if dept_match:
        filters[catalog.DIMENSION_DEPARTMENT] = dept_match.group(1).upper()

    if "high risk" in question or "high-risk" in question:
        filters[catalog.DIMENSION_TIER] = "high"
    elif "watch" in question and "tier" in question:
        filters[catalog.DIMENSION_TIER] = "watch"

    if "attendance" in question:
        metric = "attendance_present_rate"
    elif "internal mark" in question or "marks" in question:
        metric = "avg_internal_mark_pct"
    elif "average risk" in question or "avg risk" in question or "risk score" in question:
        metric = "avg_risk_score"
    elif "risk type" in question or "attendance risk" in question:
        metric = "students_with_risk_type"
        if "attendance" in question:
            filters[catalog.DIMENSION_RISK_TYPE] = "attendance"
        elif "academic" in question:
            filters[catalog.DIMENSION_RISK_TYPE] = "academic"
        elif "fee" in question:
            filters[catalog.DIMENSION_RISK_TYPE] = "fee"
    elif "tier" in question or "distribution" in question:
        metric = "risk_tier_count"
        dimensions = [catalog.DIMENSION_TIER]
    elif "how many students" in question or "student count" in question:
        metric = "student_count"
    elif "assessed" in question:
        metric = "assessed_student_count"
    else:
        return None

    if "by department" in question:
        dimensions = list(dict.fromkeys([*dimensions, catalog.DIMENSION_DEPARTMENT]))

    return {"metric": metric, "dimensions": dimensions, "filters": filters, "limit": 100}


def _narrate(payload: str) -> str:
    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        return "Here is what your governed data shows."
    rows = data.get("rows") or []
    metric = data.get("metric", "metric")
    if not rows:
        return f"No rows were returned for {metric}."
    if len(rows) == 1 and len(rows[0]) <= 2:
        value = rows[0].get("value")
        return f"The governed {metric} value is {value}."
    return f"Found {len(rows)} row(s) for {metric} from your governed data."
