"""placement_drives deleted_at

Revision ID: e6f7a8b9c0d1
Revises: d5e6f7a8b9c0
Create Date: 2026-07-01 21:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "e6f7a8b9c0d1"
down_revision: Union[str, None] = "d5e6f7a8b9c0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'placement_drives' AND column_name = 'deleted_at'
          ) THEN
            ALTER TABLE placement_drives ADD COLUMN deleted_at TIMESTAMP WITHOUT TIME ZONE;
          END IF;
        END $$;
        """
    )


def downgrade() -> None:
    op.drop_column("placement_drives", "deleted_at")
