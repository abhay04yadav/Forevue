"""Faculty dashboard and workspace API tests."""

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


def _insert_user(superuser_connection, tenant_id, email: str, role: str):
    uid = superuser_connection.execute(
        text("INSERT INTO users (tenant_id, email, password_hash, role) VALUES (:t, :e, 'x', :r) RETURNING id"),
        {"t": tenant_id, "e": email, "r": role},
    ).scalar_one()
    superuser_connection.commit()
    return uid


def _insert_faculty_scope(superuser_connection, tenant_id, user_id, scope_type: str, scope_ref: str):
    superuser_connection.execute(
        text(
            "INSERT INTO faculty_scopes (tenant_id, user_id, scope_type, scope_ref) "
            "VALUES (:t, :u, :st, :sr)"
        ),
        {"t": tenant_id, "u": user_id, "st": scope_type, "sr": scope_ref},
    )
    superuser_connection.commit()


def _token_for(tenant_id, user_id, role: str) -> str:
    return create_access_token(user_id, tenant_id, role)


def test_faculty_dashboard_requires_faculty_role(client, superuser_connection):
    slug = "faculty-dash-college"
    token = _register(client, slug)
    tenant_id = _tenant_id_for_slug(superuser_connection, slug)
    student_id = _insert_user(superuser_connection, tenant_id, "stu@f.edu", "student")
    student_token = _token_for(tenant_id, student_id, "student")

    resp = client.get("/faculty/dashboard", headers=_auth(student_token))
    assert resp.status_code == 403


def test_faculty_dashboard_empty_scope(client, superuser_connection):
    slug = "faculty-empty-college"
    _register(client, slug)
    tenant_id = _tenant_id_for_slug(superuser_connection, slug)
    faculty_id = _insert_user(superuser_connection, tenant_id, "fac@empty.edu", "faculty")
    faculty_token = _token_for(tenant_id, faculty_id, "faculty")

    resp = client.get("/faculty/dashboard", headers=_auth(faculty_token))
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["has_scope"] is False
    assert data["kpis"] == []


def test_faculty_generate_notice_creates_artifact(client, superuser_connection):
    slug = "faculty-gen-college"
    _register(client, slug)
    tenant_id = _tenant_id_for_slug(superuser_connection, slug)
    faculty_id = _insert_user(superuser_connection, tenant_id, "fac@gen.edu", "faculty")
    _insert_faculty_scope(superuser_connection, tenant_id, faculty_id, "department", "CSE")
    faculty_token = _token_for(tenant_id, faculty_id, "faculty")

    resp = client.post(
        "/faculty/generate",
        headers=_auth(faculty_token),
        json={"feature": "notice", "params": {"title": "Test notice", "intent": "Lab tomorrow"}},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["status"] == "completed"
    assert body["result_artifact_id"] is not None

    art = client.get(f"/faculty/artifacts/{body['result_artifact_id']}", headers=_auth(faculty_token))
    assert art.status_code == 200
    assert "Test notice" in art.json()["title"]
