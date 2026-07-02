"""Student dashboard API endpoints."""

from datetime import UTC, datetime
from zoneinfo import ZoneInfo

from sqlalchemy import text

from app.core.security import create_access_token
from app.services.student_dashboard_service import _due_label

IST = ZoneInfo("Asia/Kolkata")


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


def _insert_student(superuser_connection, tenant_id, roll_no: str):
    sid = superuser_connection.execute(
        text("INSERT INTO students (tenant_id, canonical_roll_no, name) VALUES (:t, :r, :r) RETURNING id"),
        {"t": tenant_id, "r": roll_no},
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


def _link_user_to_student(superuser_connection, user_id, student_id):
    superuser_connection.execute(
        text("UPDATE users SET student_id = :s WHERE id = :u"),
        {"s": student_id, "u": user_id},
    )
    superuser_connection.commit()


def _token_for(tenant_id, user_id, role: str) -> str:
    return create_access_token(user_id, tenant_id, role)


def test_student_dashboard_endpoint(client, superuser_connection):
    slug = "dash-student-college"
    _register(client, slug)
    tenant_id = _tenant_id_for_slug(superuser_connection, slug)
    own_id = _insert_student(superuser_connection, tenant_id, "DASH001")
    user_id = _insert_user(superuser_connection, tenant_id, "dashstu@scope.edu", "student")
    _link_user_to_student(superuser_connection, user_id, own_id)
    token = _token_for(tenant_id, user_id, "student")

    resp = client.get(f"/students/{own_id}/dashboard", headers=_auth(token))
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["student_id"] == str(own_id)
    assert "kpis" in data
    assert "daily_brief" in data


def test_student_timetable_endpoint(client, superuser_connection):
    slug = "tt-student-college"
    _register(client, slug)
    tenant_id = _tenant_id_for_slug(superuser_connection, slug)
    own_id = _insert_student(superuser_connection, tenant_id, "TT001")
    user_id = _insert_user(superuser_connection, tenant_id, "ttstu@scope.edu", "student")
    _link_user_to_student(superuser_connection, user_id, own_id)
    token = _token_for(tenant_id, user_id, "student")

    resp = client.get(f"/students/{own_id}/timetable", headers=_auth(token))
    assert resp.status_code == 200, resp.text
    assert "sessions" in resp.json()


def test_student_assignments_endpoint(client, superuser_connection):
    slug = "asg-student-college"
    _register(client, slug)
    tenant_id = _tenant_id_for_slug(superuser_connection, slug)
    own_id = _insert_student(superuser_connection, tenant_id, "ASG001")
    user_id = _insert_user(superuser_connection, tenant_id, "asgstu@scope.edu", "student")
    _link_user_to_student(superuser_connection, user_id, own_id)
    token = _token_for(tenant_id, user_id, "student")

    resp = client.get(f"/students/{own_id}/assignments", headers=_auth(token))
    assert resp.status_code == 200, resp.text
    assert "items" in resp.json()


def test_campus_announcements_endpoint(client, superuser_connection):
    slug = "campus-student-college"
    token = _register(client, slug)

    resp = client.get("/campus/announcements", headers=_auth(token))
    assert resp.status_code == 200, resp.text
    assert isinstance(resp.json(), list)


def test_due_label_does_not_use_platform_specific_strftime():
    """Regression: %-I in strftime crashes on Windows."""
    due = datetime(2026, 7, 1, 16, 0, tzinfo=UTC)
    label = _due_label(due)
    assert "today" in label.lower() or "due" in label.lower()
