"""Context assembly for AI requests (Ch3 §4)."""

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy.orm import Session

from app.services.ai.memory.session import MemoryTurn
from app.services.ai.rag.retriever import RetrievedEvidence
from app.services.ai.semantic.catalog import metrics_for_role
from app.services.ai.semantic.types import MetricDefinition
from app.services.ai.tools.registry import tool_definitions_for_role


@dataclass
class BuiltContext:
    system_framing: str
    role: str
    tenant_id: UUID
    user_id: UUID
    metrics: list[MetricDefinition]
    tool_definitions: list[dict]
    question: str
    memory_turns: list[MemoryTurn]
    retrieved_evidence: list[RetrievedEvidence]


class ContextBuilder:
    def build(
        self,
        session: Session,
        *,
        tenant_id: UUID,
        user_id: UUID,
        role: str,
        question: str,
        memory_turns: list[MemoryTurn] | None = None,
    ) -> BuiltContext:
        from app.services.ai.rag.retriever import retrieve_evidence

        metrics = metrics_for_role(role)
        evidence = retrieve_evidence(session, tenant_id=tenant_id, question=question)
        return BuiltContext(
            system_framing=_system_framing(evidence),
            role=role,
            tenant_id=tenant_id,
            user_id=user_id,
            metrics=metrics,
            tool_definitions=tool_definitions_for_role(role),
            question=question,
            memory_turns=memory_turns or [],
            retrieved_evidence=evidence,
        )


def _system_framing(evidence: list[RetrievedEvidence]) -> str:
    base = (
        "You are Forevue's governed analytics assistant. Select a governed semantic metric "
        "via tool calling or abstain. Never invent numbers or emit SQL. "
        "Quantitative facts must come only from tool results; narrative evidence may cite "
        "retrieved documents below."
    )
    if not evidence:
        return base
    lines = [base, "", "Retrieved governed evidence (cite only when relevant):"]
    for item in evidence:
        lines.append(f"- [{item.source_label}] {item.chunk_text}")
    return "\n".join(lines)
