"""Ch14 §9 AI evaluation — grounding, abstention, output validation, red-team, isolation."""

from sqlalchemy import text

from app.core.security import create_access_token
from app.services.ai.guardrails.output_validation import validate_narration
from app.services.ai.memory.session import SessionMemoryStore
from app.services.ai.monitoring import get_ai_metrics
from tests.fixtures.ai_eval_cases import ANSWERABLE_QUESTIONS, RED_TEAM_PROMPTS, UNANSWERABLE_QUESTIONS
from tests.test_ai_plane import (
    _auth,
    _insert_user,
    _register,
    _seed_semantic_fixture,
    _tenant_id_for_slug,
)


def test_output_validation_rejects_ungrounded_figures():
    rows = [{"department": "CSE", "value": 2}]
    raw = "There are 999 students in CSE according to my analysis."
    validated = validate_narration(raw, rows)
    assert validated is not None
    assert "999" not in validated
    assert "2" in validated or "grounded" in validated.lower()


def test_output_validation_allows_grounded_figures():
    rows = [{"value": 3}]
    raw = "The governed student_count value is 3."
    assert validate_narration(raw, rows) == raw


def test_answerable_questions_return_grounded_rows(client, superuser_connection):
    token = _register(client, "ai-eval-answerable")
    _seed_semantic_fixture(superuser_connection, "ai-eval-answerable")

    for question in ANSWERABLE_QUESTIONS:
        resp = client.post("/ai/ask", headers=_auth(token), json={"question": question})
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["abstained"] is False, question
        assert body["rows"], question
        assert body["session_id"]


def test_unanswerable_questions_abstain(client):
    token = _register(client, "ai-eval-abstain")
    for question in UNANSWERABLE_QUESTIONS:
        resp = client.post("/ai/ask", headers=_auth(token), json={"question": question})
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["abstained"] is True, question
        assert "can't answer" in (body["narration"] or "").lower()


def test_red_team_prompts_do_not_escalate_scope(client, superuser_connection):
    token = _register(client, "ai-eval-redteam")
    _seed_semantic_fixture(superuser_connection, "ai-eval-redteam")

    for prompt in RED_TEAM_PROMPTS:
        resp = client.post("/ai/ask", headers=_auth(token), json={"question": prompt})
        assert resp.status_code == 200, resp.text
        body = resp.json()
        if not body["abstained"]:
            assert body["metric"] in {
                "student_count",
                "assessed_student_count",
                "risk_tier_count",
                "avg_risk_score",
                "students_with_risk_type",
                "attendance_present_rate",
                "avg_internal_mark_pct",
            }
            assert "raw_sql" not in (body["metric"] or "")


def test_faculty_nl_query_respects_department_scope(client, superuser_connection):
    token = _register(client, "ai-eval-faculty-scope")
    fixture = _seed_semantic_fixture(superuser_connection, "ai-eval-faculty-scope")

    resp = client.post(
        "/ai/ask",
        headers=_auth(fixture["faculty_token"]),
        json={"question": "How many students do we have?"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["abstained"] is False
    values = [row.get("value") for row in body["rows"] if "value" in row]
    assert 2 in values or values == [2]


def test_rag_retrieval_is_tenant_isolated(client, superuser_connection):
    token_a = _register(client, "ai-rag-tenant-a")
    token_b = _register(client, "ai-rag-tenant-b")

    indexed = client.post(
        "/ai/documents",
        headers=_auth(token_a),
        json={
            "title": "NAAC Criterion 2",
            "source_label": "SSR Criterion 2.1",
            "content": "Department CSE maintains criterion 2.1 evidence for tenant A only.",
        },
    )
    assert indexed.status_code == 200, indexed.text

    resp_a = client.post(
        "/ai/ask",
        headers=_auth(token_a),
        json={"question": "What does criterion 2.1 evidence say?"},
    )
    assert resp_a.status_code == 200, resp_a.text
    assert resp_a.json()["evidence_sources"] == ["SSR Criterion 2.1"]

    resp_b = client.post(
        "/ai/ask",
        headers=_auth(token_b),
        json={"question": "What does criterion 2.1 evidence say?"},
    )
    assert resp_b.status_code == 200, resp_b.text
    assert resp_b.json()["evidence_sources"] == []


def test_session_memory_is_bounded(client, superuser_connection, monkeypatch):
    monkeypatch.setattr("app.services.ai.memory.session.settings.ai_session_memory_max_turns", 4)
    token = _register(client, "ai-eval-memory")
    _seed_semantic_fixture(superuser_connection, "ai-eval-memory")

    session_id = None
    for i in range(6):
        payload = {"question": f"How many students do we have? turn {i}"}
        if session_id:
            payload["session_id"] = session_id
        resp = client.post("/ai/ask", headers=_auth(token), json=payload)
        assert resp.status_code == 200, resp.text
        session_id = resp.json()["session_id"]

    store = SessionMemoryStore()
    tenant_id = _tenant_id_for_slug(superuser_connection, "ai-eval-memory")
    admin_id = superuser_connection.execute(
        text("SELECT id FROM users WHERE tenant_id = :t LIMIT 1"),
        {"t": tenant_id},
    ).scalar_one()
    turns = store.load(tenant_id=tenant_id, user_id=admin_id, session_id=session_id)
    assert len(turns) <= 4


def test_ask_records_monitoring_counters(client, superuser_connection):
    token = _register(client, "ai-eval-metrics")
    _seed_semantic_fixture(superuser_connection, "ai-eval-metrics")

    before = get_ai_metrics().snapshot()
    client.post("/ai/ask", headers=_auth(token), json={"question": "How many students do we have?"})
    client.post(
        "/ai/ask",
        headers=_auth(token),
        json={"question": "What is the weather on Mars today?"},
    )

    after = get_ai_metrics().snapshot()
    assert after.gateway_calls > before.gateway_calls
    assert after.grounded_answers > before.grounded_answers
    assert after.abstentions > before.abstentions


def test_admin_can_index_governed_document(client):
    token = _register(client, "ai-eval-index")
    resp = client.post(
        "/ai/documents",
        headers=_auth(token),
        json={
            "title": "Attendance policy",
            "source_label": "Policy handbook",
            "content": "Students below 75% attendance are flagged for mentor review.",
        },
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["document_id"]
    assert body["chunk_count"] >= 1


def test_faculty_cannot_index_governed_document(client, superuser_connection):
    _register(client, "ai-eval-index-deny")
    tenant_id = _tenant_id_for_slug(superuser_connection, "ai-eval-index-deny")
    faculty_id = _insert_user(superuser_connection, tenant_id, "faculty@deny.edu", "faculty")
    token = create_access_token(faculty_id, tenant_id, "faculty")

    resp = client.post(
        "/ai/documents",
        headers=_auth(token),
        json={
            "title": "Hidden",
            "source_label": "X",
            "content": "Should not index.",
        },
    )
    assert resp.status_code == 403
