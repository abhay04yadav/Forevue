"""user_student_link

Revision ID: f3c8a1b2d4e5
Revises: e8a1c4d29f01
Create Date: 2026-06-30 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "f3c8a1b2d4e5"
down_revision: Union[str, None] = "e8a1c4d29f01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("student_id", sa.UUID(), nullable=True))
    op.create_foreign_key(
        "fk_users_student_id_students",
        "users",
        "students",
        ["student_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(op.f("ix_users_student_id"), "users", ["student_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_users_student_id"), table_name="users")
    op.drop_constraint("fk_users_student_id_students", "users", type_="foreignkey")
    op.drop_column("users", "student_id")
