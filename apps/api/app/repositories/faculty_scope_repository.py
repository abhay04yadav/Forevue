from uuid import UUID

from sqlalchemy import select

from app.models.risk import FacultyScope
from app.repositories.base import TenantRepository


class FacultyScopeRepository(TenantRepository):
    model = FacultyScope

    def list_for_user(self, user_id: UUID) -> list[FacultyScope]:
        return self.session.execute(self._scoped().where(FacultyScope.user_id == user_id)).scalars().all()

    def get_for_user(self, user_id: UUID, scope_id: UUID) -> FacultyScope | None:
        return self.session.execute(
            self._scoped().where(FacultyScope.user_id == user_id, FacultyScope.id == scope_id)
        ).scalar_one_or_none()

    def find_duplicate(self, user_id: UUID, scope_type: str, scope_ref: str) -> FacultyScope | None:
        return self.session.execute(
            select(FacultyScope).where(
                FacultyScope.tenant_id == self.tenant_id,
                FacultyScope.user_id == user_id,
                FacultyScope.scope_type == scope_type,
                FacultyScope.scope_ref == scope_ref,
            )
        ).scalar_one_or_none()
