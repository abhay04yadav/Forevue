"""AI plane API — governed semantic layer and NL ask (Ch3, Phase 7).

Role and tenant context are always resolved server-side from the verified JWT.
Students may use /ai/ask when linked to a student_id (self-scope).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, get_current_user, get_tenant_session
from app.core.exceptions import ForbiddenException
from app.schemas.ai import (
    AskRequest,
    AskResponse,
    GovernedDocumentCreateRequest,
    GovernedDocumentCreateResponse,
    SemanticMetricSchema,
    SemanticQueryRequest,
    SemanticQueryResponse,
    SemanticSchemaResponse,
)
from app.services.ai.orchestrator import ask_question
from app.services.ai.rag.chunking import chunk_text
from app.services.ai.rag.indexer import index_governed_document
from app.services.ai.semantic.catalog import metrics_for_role
from app.services.ai.semantic.executor import execute_semantic_query
from app.services.ai.semantic.types import SemanticSelection

router = APIRouter(prefix="/ai", tags=["ai"])


def _ensure_admin(current_user: CurrentUser) -> None:
    if current_user.role != "admin":
        raise ForbiddenException("Only admins may index governed documents.")


@router.get("/semantic/schema", response_model=SemanticSchemaResponse)
def get_semantic_schema(current_user: CurrentUser = Depends(get_current_user)) -> SemanticSchemaResponse:
    if current_user.role == "student":
        raise ForbiddenException("Students may use /ai/ask for self-service questions.")
    metrics = metrics_for_role(current_user.role)
    return SemanticSchemaResponse(
        role=current_user.role,
        metrics=[
            SemanticMetricSchema(
                id=metric.id,
                label=metric.label,
                description=metric.description,
                value_type=metric.value_type,
                allowed_dimensions=sorted(metric.allowed_dimensions),
                allowed_filters=sorted(metric.allowed_filters),
            )
            for metric in metrics
        ],
    )


@router.post("/semantic/query", response_model=SemanticQueryResponse)
def post_semantic_query(
    body: SemanticQueryRequest,
    session: Session = Depends(get_tenant_session),
    current_user: CurrentUser = Depends(get_current_user),
) -> SemanticQueryResponse:
    if current_user.role == "student":
        raise ForbiddenException("Students may use /ai/ask for self-service questions.")
    result = execute_semantic_query(
        session,
        tenant_id=current_user.tenant_id,
        role=current_user.role,
        user_id=current_user.user_id,
        selection=SemanticSelection(
            metric=body.metric,
            dimensions=body.dimensions,
            filters=body.filters,
            limit=body.limit,
        ),
    )
    return SemanticQueryResponse(
        metric=result.metric,
        columns=result.columns,
        rows=result.rows,
        row_count=result.row_count,
        truncated=result.truncated,
        interpretation=result.interpretation,
    )


@router.post("/documents", response_model=GovernedDocumentCreateResponse)
def post_index_document(
    body: GovernedDocumentCreateRequest,
    session: Session = Depends(get_tenant_session),
    current_user: CurrentUser = Depends(get_current_user),
) -> GovernedDocumentCreateResponse:
    _ensure_admin(current_user)
    document_id = index_governed_document(
        session,
        tenant_id=current_user.tenant_id,
        title=body.title,
        source_label=body.source_label,
        content=body.content,
        created_by=current_user.user_id,
    )
    return GovernedDocumentCreateResponse(
        document_id=str(document_id),
        chunk_count=len(chunk_text(body.content)),
    )


@router.post("/ask", response_model=AskResponse)
def post_ask(
    body: AskRequest,
    session: Session = Depends(get_tenant_session),
    current_user: CurrentUser = Depends(get_current_user),
) -> AskResponse:
    if current_user.role == "student":
        from sqlalchemy import select

        from app.models.user import User

        user = session.execute(select(User).where(User.id == current_user.user_id)).scalar_one_or_none()
        if user is None or user.student_id is None:
            raise ForbiddenException("Student account is not linked to a student record.")
    result = ask_question(
        session,
        tenant_id=current_user.tenant_id,
        user_id=current_user.user_id,
        role=current_user.role,
        question=body.question,
        session_id=body.session_id,
    )
    return AskResponse(
        abstained=result.abstained,
        interpretation=result.interpretation,
        metric=result.metric,
        columns=result.columns,
        rows=result.rows,
        narration=result.narration,
        cached=result.cached,
        session_id=result.session_id,
        evidence_sources=result.evidence_sources,
    )
