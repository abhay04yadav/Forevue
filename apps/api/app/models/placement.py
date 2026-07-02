from datetime import date, datetime
from uuid import UUID

from sqlalchemy import ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, PKMixin, SoftDeleteMixin, TenantMixin, TimestampMixin

DRIVE_STATUSES = ("draft", "active", "closed")


class PlacementDrive(PKMixin, TenantMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "placement_drives"

    title: Mapped[str] = mapped_column(nullable=False)
    company_name: Mapped[str] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(nullable=False, server_default=text("'draft'"))
    drive_date: Mapped[date | None] = mapped_column(nullable=True)
    location: Mapped[str | None] = mapped_column(nullable=True)
    created_by: Mapped[UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
