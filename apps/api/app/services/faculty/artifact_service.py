"""Faculty artifact workspace (RSDD generative path — draft only)."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenException, NotFoundException
from app.models.faculty_workspace import FacultyArtifact


def list_artifacts(
    session: Session,
    tenant_id: UUID,
    owner_user_id: UUID,
    *,
    artifact_type: str | None = None,
) -> list[FacultyArtifact]:
    q = select(FacultyArtifact).where(
        FacultyArtifact.tenant_id == tenant_id,
        FacultyArtifact.owner_user_id == owner_user_id,
        FacultyArtifact.is_deleted.is_(False),
    )
    if artifact_type:
        q = q.where(FacultyArtifact.artifact_type == artifact_type)
    return list(session.execute(q.order_by(FacultyArtifact.updated_at.desc())).scalars().all())


def get_artifact(session: Session, tenant_id: UUID, artifact_id: UUID, user_id: UUID, *, is_admin: bool) -> FacultyArtifact:
    art = session.execute(
        select(FacultyArtifact).where(
            FacultyArtifact.tenant_id == tenant_id,
            FacultyArtifact.id == artifact_id,
            FacultyArtifact.is_deleted.is_(False),
        )
    ).scalar_one_or_none()
    if art is None:
        raise NotFoundException("Artifact not found.")
    if not is_admin and art.owner_user_id != user_id:
        raise NotFoundException("Artifact not found.")
    return art


def create_artifact(
    session: Session,
    tenant_id: UUID,
    owner_user_id: UUID,
    *,
    artifact_type: str,
    title: str,
    content_json: dict,
    source_job_id: UUID | None = None,
) -> FacultyArtifact:
    art = FacultyArtifact(
        tenant_id=tenant_id,
        owner_user_id=owner_user_id,
        artifact_type=artifact_type,
        title=title,
        status="draft",
        content_json=content_json,
        source_job_id=source_job_id,
    )
    session.add(art)
    session.flush()
    return art


def update_artifact(
    session: Session,
    tenant_id: UUID,
    artifact_id: UUID,
    user_id: UUID,
    *,
    title: str | None = None,
    status: str | None = None,
    content_json: dict | None = None,
) -> FacultyArtifact:
    art = get_artifact(session, tenant_id, artifact_id, user_id, is_admin=False)
    if title is not None:
        art.title = title
    if status is not None:
        art.status = status
    if content_json is not None:
        art.content_json = content_json
        art.version += 1
    session.flush()
    return art


def export_artifact_markdown(art: FacultyArtifact) -> str:
    body = art.content_json.get("markdown") or art.content_json.get("body") or ""
    if not body and art.content_json.get("sections"):
        parts = []
        for sec in art.content_json["sections"]:
            parts.append(f"## {sec.get('title', 'Section')}\n\n{sec.get('body', '')}")
        body = "\n\n".join(parts)
    return f"# {art.title}\n\n{body}".strip()
