"""extend_user_roles_hod_placement

Revision ID: c4d5e6f7a8b9
Revises: b2c3d4e5f6a7
Create Date: 2026-07-01 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = "c4d5e6f7a8b9"
down_revision: Union[str, None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_NEW_ROLES = (
    "admin",
    "principal",
    "registrar",
    "iqac",
    "faculty",
    "student",
    "hod",
    "placement",
)


def upgrade() -> None:
    op.drop_constraint("ck_users_role", "users", type_="check")
    roles_sql = ", ".join(f"'{r}'" for r in _NEW_ROLES)
    op.create_check_constraint("ck_users_role", "users", f"role IN ({roles_sql})")


def downgrade() -> None:
    op.drop_constraint("ck_users_role", "users", type_="check")
    op.create_check_constraint(
        "ck_users_role",
        "users",
        "role IN ('admin', 'principal', 'registrar', 'iqac', 'faculty', 'student')",
    )
