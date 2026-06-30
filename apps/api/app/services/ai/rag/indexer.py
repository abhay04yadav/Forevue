"""Index governed documents into tenant-scoped RAG chunks (Ch3 §6)."""

import json
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services.ai.rag.chunking import chunk_text
from app.services.ai.rag.embedder import embed_text


def index_governed_document(
    session: Session,
    *,
    tenant_id: UUID,
    title: str,
    source_label: str,
    content: str,
    created_by: UUID | None = None,
) -> UUID:
    document_id = session.execute(
        text(
            """
            INSERT INTO governed_documents (tenant_id, title, source_label, created_by)
            VALUES (:tenant_id, :title, :source_label, :created_by)
            RETURNING id
            """
        ),
        {
            "tenant_id": tenant_id,
            "title": title,
            "source_label": source_label,
            "created_by": created_by,
        },
    ).scalar_one()

    for index, chunk in enumerate(chunk_text(content)):
        embedding = embed_text(chunk)
        session.execute(
            text(
                """
                INSERT INTO governed_document_chunks
                (tenant_id, document_id, source_label, chunk_index, chunk_text, embedding_json)
                VALUES (:tenant_id, :document_id, :source_label, :chunk_index, :chunk_text, CAST(:embedding_json AS jsonb))
                """
            ),
            {
                "tenant_id": tenant_id,
                "document_id": document_id,
                "source_label": source_label,
                "chunk_index": index,
                "chunk_text": chunk,
                "embedding_json": json.dumps(embedding),
            },
        )

    session.commit()
    return document_id
