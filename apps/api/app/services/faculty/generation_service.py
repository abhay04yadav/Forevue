"""Faculty content generation jobs (RSDD §14 generative path)."""

from __future__ import annotations

import json
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenException, NotFoundException
from app.models.faculty_workspace import GENERATION_FEATURES, FacultyArtifact, GenerationJob
from app.services.faculty.artifact_service import create_artifact

_SYNC_FEATURES = {"notice", "email", "lecture_plan", "assignment"}
_ASYNC_FEATURES = {"assessment_paper", "assessment_quiz"}


def _draft_content(feature: str, params: dict) -> tuple[str, str, dict]:
    course = params.get("course_code") or params.get("course") or "your course"
    topic = params.get("topic") or params.get("unit") or "the selected unit"

    if feature == "lecture_plan":
        title = f"Lecture plan — {course}: {topic}"
        markdown = (
            f"# Session plan: {topic}\n\n"
            f"**Course:** {course}\n\n"
            "## Objectives\n"
            "- Introduce core concepts with worked examples\n"
            "- Check understanding with 2–3 formative questions\n\n"
            "## Outline (50 min)\n"
            "1. Recap (5 min)\n"
            "2. Concept block (20 min)\n"
            "3. Demonstration / activity (15 min)\n"
            "4. Summary + assignment pointer (10 min)\n\n"
            "*AI draft — review and edit before use.*"
        )
        return "lecture_plan", title, {"markdown": markdown, "course": course, "topic": topic}

    if feature in ("assessment_paper", "assessment_quiz"):
        mode = "Quiz" if feature == "assessment_quiz" else "Question paper"
        title = f"{mode} — {course}: {topic}"
        markdown = (
            f"# {mode}: {topic}\n\n"
            f"**Course:** {course} | **Duration:** {params.get('duration', '60')} min\n\n"
            "## Section A (short answer)\n"
            "1. Define the key term for this unit. [5 marks]\n"
            "2. Explain one application with an example. [10 marks]\n\n"
            "## Section B\n"
            "3. Solve the standard problem from the unit. [15 marks]\n\n"
            "*AI draft — verify against syllabus before publishing.*"
        )
        return feature, title, {"markdown": markdown, "mode": mode.lower(), "course": course}

    if feature == "assignment":
        title = f"Assignment brief — {course}: {topic}"
        markdown = (
            f"# Assignment: {topic}\n\n"
            "## Brief\n"
            "Complete the guided problem set applying concepts from this unit.\n\n"
            "## Rubric (draft)\n"
            "| Criterion | Weight |\n|-----------|--------|\n"
            "| Accuracy | 40% |\n| Clarity | 30% | Presentation | 30% |\n\n"
            "*Advisory draft only — not published to ERP.*"
        )
        return "assignment", title, {"markdown": markdown, "rubric": True}

    if feature == "notice":
        title = params.get("title") or f"Notice — {course}"
        markdown = (
            f"# {title}\n\n"
            f"{params.get('intent', 'Please note the following update for your section.')}\n\n"
            "— Faculty (draft)"
        )
        return "notice", title, {"markdown": markdown}

    if feature == "email":
        recipient = params.get("recipient_type", "student")
        if recipient == "parent" and not params.get("guardian_consent_confirmed"):
            raise ForbiddenException("Guardian consent is required before drafting parent email.")
        title = params.get("subject") or f"Email draft — {course}"
        markdown = (
            f"**Subject:** {title}\n\n"
            f"Dear {recipient},\n\n"
            f"{params.get('intent', 'I wanted to follow up regarding academic progress.')}\n\n"
            "Regards,\nFaculty\n\n"
            "*Draft only — send from your official channel after review.*"
        )
        return "email", title, {"markdown": markdown, "recipient_type": recipient}

    raise NotFoundException(f"Unknown generation feature: {feature}")


def create_generation_job(
    session: Session,
    tenant_id: UUID,
    user_id: UUID,
    *,
    feature: str,
    params: dict,
) -> GenerationJob:
    if feature not in GENERATION_FEATURES:
        raise NotFoundException(f"Unknown feature: {feature}")

    job = GenerationJob(
        tenant_id=tenant_id,
        user_id=user_id,
        feature=feature,
        params_json=params,
        status="queued",
    )
    session.add(job)
    session.flush()

    if feature in _SYNC_FEATURES or feature in _ASYNC_FEATURES:
        job.status = "running"
        session.flush()
        try:
            artifact_type, title, content = _draft_content(feature, params)
            art = create_artifact(
                session,
                tenant_id,
                user_id,
                artifact_type=artifact_type,
                title=title,
                content_json=content,
                source_job_id=job.id,
            )
            job.status = "completed"
            job.result_artifact_id = art.id
        except ForbiddenException:
            job.status = "failed"
            job.error_message = "Guardian consent required for parent email."
            raise
        except Exception as exc:  # noqa: BLE001 — job surface must capture failures
            job.status = "failed"
            job.error_message = str(exc)[:500]
        session.flush()

    return job


def list_jobs(session: Session, tenant_id: UUID, user_id: UUID, limit: int = 20) -> list[GenerationJob]:
    return list(
        session.execute(
            select(GenerationJob)
            .where(
                GenerationJob.tenant_id == tenant_id,
                GenerationJob.user_id == user_id,
                GenerationJob.is_deleted.is_(False),
            )
            .order_by(GenerationJob.created_at.desc())
            .limit(limit)
        ).scalars().all()
    )


def get_job(session: Session, tenant_id: UUID, user_id: UUID, job_id: UUID) -> GenerationJob:
    job = session.execute(
        select(GenerationJob).where(
            GenerationJob.tenant_id == tenant_id,
            GenerationJob.id == job_id,
            GenerationJob.is_deleted.is_(False),
        )
    ).scalar_one_or_none()
    if job is None or job.user_id != user_id:
        raise NotFoundException("Generation job not found.")
    return job
