"""Phase 7 AI plane acceptance tests — semantic layer, gateway, tool calling."""

from sqlalchemy import text

from app.core.security import create_access_token


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _register(client, slug: str) -> str:
    resp = client.post(
        "/auth/register",
        json={
            "tenant_name": slug,
            "tenant_slug": slug,
            "admin_email": f"admin@{slug}.edu",
            "admin_password": "supersecret1",
        },
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


def _tenant_id_for_slug(superuser_connection, slug: str):
    return superuser_connection.execute(text("SELECT id FROM tenants WHERE slug = :s"), {"s": slug}).scalar_one()


def _insert_department(superuser_connection, tenant_id, code: str):
    did = superuser_connection.execute(
        text("INSERT INTO departments (tenant_id, code, name) VALUES (:t, :c, :c) RETURNING id"),
        {"t": tenant_id, "c": code},
    ).scalar_one()
    superuser_connection.commit()
    return did


def _insert_programme(superuser_connection, tenant_id, code: str, department_id=None):
    pid = superuser_connection.execute(
        text("INSERT INTO programmes (tenant_id, code, name, department_id) VALUES (:t, :c, :c, :d) RETURNING id"),
        {"t": tenant_id, "c": code, "d": department_id},
    ).scalar_one()
    superuser_connection.commit()
    return pid


def _insert_student(superuser_connection, tenant_id, roll_no: str, programme_id=None):
    sid = superuser_connection.execute(
        text(
            "INSERT INTO students (tenant_id, canonical_roll_no, name, programme_id) VALUES (:t, :r, :r, :p) "
            "RETURNING id"
        ),
        {"t": tenant_id, "r": roll_no, "p": programme_id},
    ).scalar_one()
    superuser_connection.commit()
    return sid


def _insert_user(superuser_connection, tenant_id, email: str, role: str):
    uid = superuser_connection.execute(
        text("INSERT INTO users (tenant_id, email, password_hash, role) VALUES (:t, :e, 'x', :r) RETURNING id"),
        {"t": tenant_id, "e": email, "r": role},
    ).scalar_one()
    superuser_connection.commit()
    return uid


def _insert_faculty_scope(superuser_connection, tenant_id, user_id, scope_type: str, scope_ref: str):
    superuser_connection.execute(
        text("INSERT INTO faculty_scopes (tenant_id, user_id, scope_type, scope_ref) VALUES (:t, :u, :st, :sr)"),
        {"t": tenant_id, "u": user_id, "st": scope_type, "sr": scope_ref},
    )
    superuser_connection.commit()


def _insert_risk_assessment(superuser_connection, tenant_id, student_id, tier: str, score: float):
    superuser_connection.execute(
        text(
            "INSERT INTO risk_assessments "
            "(tenant_id, student_id, is_current, model_type, model_version, config_version, overall_score, tier, "
            "subject_minor_status, signals_snapshot, triggered_by) "
            "VALUES (:t, :s, true, 'rules', 'v1', 1, :score, :tier, 'unknown', '{}', 'manual')"
        ),
        {"t": tenant_id, "s": student_id, "score": score, "tier": tier},
    )
    superuser_connection.commit()


def _seed_semantic_fixture(superuser_connection, slug: str):
    tenant_id = _tenant_id_for_slug(superuser_connection, slug)
    cse_dept = _insert_department(superuser_connection, tenant_id, "CSE")
    ece_dept = _insert_department(superuser_connection, tenant_id, "ECE")
    cse_prog = _insert_programme(superuser_connection, tenant_id, "CSE-BTECH", cse_dept)
    ece_prog = _insert_programme(superuser_connection, tenant_id, "ECE-BTECH", ece_dept)

    s1 = _insert_student(superuser_connection, tenant_id, "CSE001", cse_prog)
    s2 = _insert_student(superuser_connection, tenant_id, "CSE002", cse_prog)
    s3 = _insert_student(superuser_connection, tenant_id, "ECE001", ece_prog)

    _insert_risk_assessment(superuser_connection, tenant_id, s1, "high", 82.0)
    _insert_risk_assessment(superuser_connection, tenant_id, s2, "watch", 55.0)
    _insert_risk_assessment(superuser_connection, tenant_id, s3, "low", 10.0)

    faculty_id = _insert_user(superuser_connection, tenant_id, "faculty@cse.edu", "faculty")
    _insert_faculty_scope(superuser_connection, tenant_id, faculty_id, "department", "CSE")

    return {
        "tenant_id": tenant_id,
        "faculty_token": create_access_token(faculty_id, tenant_id, "faculty"),
        "student_ids": [s1, s2, s3],
    }


def test_semantic_schema_lists_role_gated_metrics(client):
    token = _register(client, "ai-schema-college")
    resp = client.get("/ai/semantic/schema", headers=_auth(token))
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["role"] == "admin"
    metric_ids = {metric["id"] for metric in body["metrics"]}
    assert "student_count" in metric_ids
    assert "risk_tier_count" in metric_ids


def test_semantic_query_student_count_and_department_breakdown(client, superuser_connection):
    token = _register(client, "ai-query-college")
    _seed_semantic_fixture(superuser_connection, "ai-query-college")

    total = client.post(
        "/ai/semantic/query",
        headers=_auth(token),
        json={"metric": "student_count"},
    )
    assert total.status_code == 200, total.text
    assert total.json()["rows"][0]["value"] == 3

    by_dept = client.post(
        "/ai/semantic/query",
        headers=_auth(token),
        json={"metric": "student_count", "dimensions": ["department"]},
    )
    assert by_dept.status_code == 200, by_dept.text
    rows = {row["department"]: row["value"] for row in by_dept.json()["rows"]}
    assert rows["CSE"] == 2
    assert rows["ECE"] == 1


def test_semantic_query_rejects_unknown_metric(client):
    token = _register(client, "ai-reject-college")
    resp = client.post(
        "/ai/semantic/query",
        headers=_auth(token),
        json={"metric": "raw_sql_count"},
    )
    assert resp.status_code == 400


def test_semantic_query_faculty_scope_limits_visible_students(client, superuser_connection):
    token = _register(client, "ai-scope-college")
    fixture = _seed_semantic_fixture(superuser_connection, "ai-scope-college")

    admin = client.post("/ai/semantic/query", headers=_auth(token), json={"metric": "student_count"})
    faculty = client.post(
        "/ai/semantic/query",
        headers=_auth(fixture["faculty_token"]),
        json={"metric": "student_count"},
    )
    assert admin.status_code == 200
    assert faculty.status_code == 200
    assert admin.json()["rows"][0]["value"] == 3
    assert faculty.json()["rows"][0]["value"] == 2


def test_student_role_blocked_from_ai_plane(client, superuser_connection):
    _register(client, "ai-student-college")
    tenant_id = _tenant_id_for_slug(superuser_connection, "ai-student-college")
    student_id = _insert_user(superuser_connection, tenant_id, "student@college.edu", "student")
    token = create_access_token(student_id, tenant_id, "student")

    resp = client.get("/ai/semantic/schema", headers=_auth(token))
    assert resp.status_code == 403


def test_ask_uses_stub_tool_calling_and_returns_grounded_rows(client, superuser_connection):
    token = _register(client, "ai-ask-college")
    _seed_semantic_fixture(superuser_connection, "ai-ask-college")

    resp = client.post(
        "/ai/ask",
        headers=_auth(token),
        json={"question": "How many students do we have by department?"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["abstained"] is False
    assert body["metric"] == "student_count"
    assert len(body["rows"]) >= 2
    assert body["narration"]
    assert "interpretation" in body and "metric=student_count" in body["interpretation"]


def test_ask_abstains_when_stub_cannot_map_question(client):
    token = _register(client, "ai-abstain-college")
    resp = client.post(
        "/ai/ask",
        headers=_auth(token),
        json={"question": "What is the weather on Mars today?"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["abstained"] is True
    assert "can't answer" in (body["narration"] or "").lower()


def test_gateway_cache_is_tenant_partitioned(client, superuser_connection):
    token_a = _register(client, "ai-cache-a")
    token_b = _register(client, "ai-cache-b")
    _seed_semantic_fixture(superuser_connection, "ai-cache-a")
    _seed_semantic_fixture(superuser_connection, "ai-cache-b")

    question = {"question": "How many students do we have?"}
    first = client.post("/ai/ask", headers=_auth(token_a), json=question)
    second = client.post("/ai/ask", headers=_auth(token_a), json=question)
    other_tenant = client.post("/ai/ask", headers=_auth(token_b), json=question)

    assert first.status_code == 200
    assert second.status_code == 200
    assert other_tenant.status_code == 200
    assert second.json()["cached"] is True
    # Different tenant must not inherit another tenant's cached intent path blindly.
    assert other_tenant.json()["rows"][0]["value"] == 3
