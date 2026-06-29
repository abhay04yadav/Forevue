from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.user import VALID_ROLES

_EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class UserCreateRequest(BaseModel):
    email: str = Field(pattern=_EMAIL_PATTERN)
    password: str = Field(min_length=8)
    role: str


class UserUpdateRequest(BaseModel):
    role: str | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class FacultyScopeCreateRequest(BaseModel):
    scope_type: str
    scope_ref: str = Field(min_length=1)


class FacultyScopeResponse(BaseModel):
    id: UUID
    user_id: UUID
    scope_type: str
    scope_ref: str
    created_at: datetime

    model_config = {"from_attributes": True}


def validate_role(role: str) -> None:
    if role not in VALID_ROLES:
        raise ValueError(f"role must be one of {VALID_ROLES}")
