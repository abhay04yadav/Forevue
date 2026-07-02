"""placement_drives rls

Revision ID: f7a8b9c0d1e2
Revises: e6f7a8b9c0d1
Create Date: 2026-07-01 21:30:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = "f7a8b9c0d1e2"
down_revision: Union[str, None] = "e6f7a8b9c0d1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE placement_drives ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE placement_drives FORCE ROW LEVEL SECURITY")
    op.execute(
        """
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE tablename = 'placement_drives' AND policyname = 'tenant_isolation'
          ) THEN
            CREATE POLICY tenant_isolation ON placement_drives
              USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
              WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
          END IF;
        END $$;
        """
    )
    op.execute("GRANT SELECT, INSERT, UPDATE ON placement_drives TO app_user")


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS tenant_isolation ON placement_drives")
    op.execute("REVOKE ALL ON placement_drives FROM app_user")
