"""Semantic query tool implementation (Ch3 §5)."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.services.ai.semantic.executor import execute_semantic_query
from app.services.ai.semantic.types import SemanticQueryResult, SemanticSelection
from app.services.ai.tools.registry import SEMANTIC_QUERY_TOOL


def execute_tool(
    session: Session,
    *,
    tenant_id: UUID,
    role: str,
    user_id: UUID,
    tool_name: str,
    arguments: dict,
) -> SemanticQueryResult:
    if tool_name != SEMANTIC_QUERY_TOOL:
        raise ValueError(f"Unknown tool: {tool_name}")
    selection = SemanticSelection(
        metric=str(arguments.get("metric", "")),
        dimensions=list(arguments.get("dimensions") or []),
        filters=dict(arguments.get("filters") or {}),
        limit=int(arguments.get("limit") or 100),
    )
    return execute_semantic_query(
        session,
        tenant_id=tenant_id,
        role=role,
        user_id=user_id,
        selection=selection,
    )
