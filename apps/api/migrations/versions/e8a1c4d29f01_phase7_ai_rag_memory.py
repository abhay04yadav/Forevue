"""phase7_ai_rag_memory

Revision ID: e8a1c4d29f01
Revises: d67e374fb99f
Create Date: 2026-06-29 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "e8a1c4d29f01"
down_revision: Union[str, None] = "d67e374fb99f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_RLS_TABLES = (
    "governed_documents",
    "governed_document_chunks",
)


def _apply_rls(table_name: str) -> None:
    op.execute(f"ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY")
    op.execute(f"ALTER TABLE {table_name} FORCE ROW LEVEL SECURITY")
    op.execute(
        f"""
        CREATE POLICY tenant_isolation ON {table_name}
          USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
          WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid)
        """
    )


def upgrade() -> None:
    op.create_table(
        "governed_documents",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("source_label", sa.String(), nullable=False),
        sa.Column("created_by", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_governed_documents_tenant_id"), "governed_documents", ["tenant_id"], unique=False)

    op.create_table(
        "governed_document_chunks",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("document_id", sa.UUID(), nullable=False),
        sa.Column("source_label", sa.String(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("chunk_text", sa.Text(), nullable=False),
        sa.Column("embedding_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["governed_documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_governed_document_chunks_tenant_id",
        "governed_document_chunks",
        ["tenant_id"],
        unique=False,
    )
    op.create_index(
        "ix_governed_document_chunks_document_id",
        "governed_document_chunks",
        ["document_id"],
        unique=False,
    )

    for table in _RLS_TABLES:
        _apply_rls(table)
        op.execute(f"GRANT SELECT, INSERT, UPDATE ON {table} TO app_user")


def downgrade() -> None:
    op.execute(f"REVOKE ALL ON {', '.join(_RLS_TABLES)} FROM app_user")
    op.drop_index("ix_governed_document_chunks_document_id", table_name="governed_document_chunks")
    op.drop_index("ix_governed_document_chunks_tenant_id", table_name="governed_document_chunks")
    op.drop_table("governed_document_chunks")
    op.drop_index(op.f("ix_governed_documents_tenant_id"), table_name="governed_documents")
    op.drop_table("governed_documents")
