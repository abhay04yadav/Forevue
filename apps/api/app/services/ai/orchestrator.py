"""NL ask orchestration — context, gateway, tools, narration (Ch3 §9)."""

import json
from dataclasses import dataclass
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.services.ai.context.builder import ContextBuilder
from app.services.ai.gateway.gateway import gateway
from app.services.ai.gateway.types import GatewayMessage, GatewayRequest
from app.services.ai.guardrails.output_validation import validate_narration
from app.services.ai.memory.session import SessionMemoryStore
from app.services.ai.monitoring import get_ai_metrics
from app.services.ai.tools.semantic_query import execute_tool


@dataclass
class AskResult:
    abstained: bool
    interpretation: str | None
    metric: str | None
    columns: list[str]
    rows: list[dict[str, Any]]
    narration: str | None
    cached: bool
    session_id: str
    evidence_sources: list[str]


def ask_question(
    session: Session,
    *,
    tenant_id: UUID,
    user_id: UUID,
    role: str,
    question: str,
    session_id: str | None = None,
) -> AskResult:
    memory_store = SessionMemoryStore()
    resolved_session_id = memory_store.ensure_session_id(session_id)
    memory_turns = memory_store.load(tenant_id=tenant_id, user_id=user_id, session_id=resolved_session_id)

    context = ContextBuilder().build(
        session,
        tenant_id=tenant_id,
        user_id=user_id,
        role=role,
        question=question,
        memory_turns=memory_turns,
    )

    intent_messages = [
        GatewayMessage(role="system", content=context.system_framing),
        *[GatewayMessage(role=turn.role, content=turn.content) for turn in context.memory_turns],
        GatewayMessage(role="user", content=question),
    ]
    intent_request = GatewayRequest(
        tenant_id=str(tenant_id),
        task_type="nl_intent",
        messages=intent_messages,
        tools=context.tool_definitions,
    )
    intent_response = gateway.complete(intent_request)

    evidence_sources = sorted({item.source_label for item in context.retrieved_evidence})

    if not intent_response.tool_calls:
        message = intent_response.content or "I can't answer that from your data."
        get_ai_metrics().record_abstention()
        memory_store.append(
            tenant_id=tenant_id,
            user_id=user_id,
            session_id=resolved_session_id,
            question=question,
            answer_summary=message,
        )
        return AskResult(
            abstained=True,
            interpretation=None,
            metric=None,
            columns=[],
            rows=[],
            narration=message,
            cached=intent_response.cached,
            session_id=resolved_session_id,
            evidence_sources=evidence_sources,
        )

    tool_call = intent_response.tool_calls[0]
    query_result = execute_tool(
        session,
        tenant_id=tenant_id,
        role=role,
        user_id=user_id,
        tool_name=tool_call.name,
        arguments=tool_call.arguments,
    )

    narration_request = GatewayRequest(
        tenant_id=str(tenant_id),
        task_type="narration",
        messages=[
            GatewayMessage(
                role="user",
                content=json.dumps(
                    {
                        "metric": query_result.metric,
                        "columns": query_result.columns,
                        "rows": query_result.rows,
                    }
                ),
            )
        ],
    )
    narration_response = gateway.complete(narration_request)

    raw_narration = narration_response.content
    validated_narration = validate_narration(raw_narration, query_result.rows)
    if validated_narration != raw_narration:
        get_ai_metrics().record_output_validation_rejection()

    get_ai_metrics().record_grounded_answer()
    answer_summary = validated_narration or query_result.interpretation
    memory_store.append(
        tenant_id=tenant_id,
        user_id=user_id,
        session_id=resolved_session_id,
        question=question,
        answer_summary=answer_summary or "",
    )

    return AskResult(
        abstained=False,
        interpretation=query_result.interpretation,
        metric=query_result.metric,
        columns=query_result.columns,
        rows=query_result.rows,
        narration=validated_narration,
        cached=intent_response.cached or narration_response.cached,
        session_id=resolved_session_id,
        evidence_sources=evidence_sources,
    )
