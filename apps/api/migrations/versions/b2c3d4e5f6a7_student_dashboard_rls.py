"""student_dashboard_rls

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-07-01 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_NEW_TABLES = (
    "timetable_sessions",
    "assignments",
    "campus_announcements",
    "student_notifications",
    "student_activity",
    "career_profiles",
    "upcoming_exams",
)


def upgrade() -> None:
    for table in _NEW_TABLES:
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
        op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")
        op.execute(
            f"""
            DO $$
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM pg_policies
                WHERE tablename = '{table}' AND policyname = 'tenant_isolation'
              ) THEN
                CREATE POLICY tenant_isolation ON {table}
                  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
                  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
              END IF;
            END $$;
            """
        )
        op.execute(f"GRANT SELECT, INSERT, UPDATE ON {table} TO app_user")


def downgrade() -> None:
    for table in reversed(_NEW_TABLES):
        op.execute(f"DROP POLICY IF EXISTS tenant_isolation ON {table}")
        op.execute(f"REVOKE ALL ON {table} FROM app_user")
