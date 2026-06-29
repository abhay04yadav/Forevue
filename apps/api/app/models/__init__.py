from app.core.audit import register_audit_hooks
from app.models.audit import AuditLog
from app.models.base import Base
from app.models.tenant import Tenant
from app.models.user import User

# Phase 2: audit hooks on User only. Canonical and risk models register hooks
# when those modules land (Phase 3+).
register_audit_hooks(User)

__all__ = [
    "Base",
    "Tenant",
    "User",
    "AuditLog",
]
