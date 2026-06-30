"""RAG retrieval over tenant-scoped governed documents (Ch3 §6, AI-6.1)."""

import json
from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.services.ai.monitoring import get_ai_metrics
from app.services.ai.rag.embedder import cosine_similarity, embed_text


@dataclass
class RetrievedEvidence:
    chunk_text: str
    source_label: str
    score: float


def retrieve_evidence(
    session: Session,
    *,
    tenant_id: UUID,
    question: str,
    limit: int | None = None,
) -> list[RetrievedEvidence]:
    top_k = limit or settings.ai_rag_top_k
    query_embedding = embed_text(question)

    rows = session.execute(
        text(
            """
            SELECT chunk_text, source_label, embedding_json
            FROM governed_document_chunks
            WHERE tenant_id = :tenant_id
            ORDER BY id
            """
        ),
        {"tenant_id": tenant_id},
    ).mappings().all()

    if not rows:
        get_ai_metrics().record_rag_retrieval(empty=True)
        return []

    scored: list[RetrievedEvidence] = []
    for row in rows:
        stored = list(json.loads(row["embedding_json"]) if isinstance(row["embedding_json"], str) else row["embedding_json"])
        score = cosine_similarity(query_embedding, stored)
        if score < settings.ai_rag_min_score:
            continue
        scored.append(
            RetrievedEvidence(
                chunk_text=row["chunk_text"],
                source_label=row["source_label"],
                score=score,
            )
        )

    scored.sort(key=lambda item: item.score, reverse=True)
    result = scored[:top_k]
    get_ai_metrics().record_rag_retrieval(empty=len(result) == 0)
    return result
