"""Phase 6 hardening acceptance tests (Ch4 §2, Ch7 §10, Ch11)."""

from sqlalchemy import text

from app.core.middleware import REQUEST_ID_HEADER


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _register(client, slug: str) -> dict:
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
    return resp.json()


def test_request_id_is_propagated(client):
    response = client.get("/health", headers={REQUEST_ID_HEADER: "trace-abc-123"})
    assert response.status_code == 200
    assert response.headers[REQUEST_ID_HEADER] == "trace-abc-123"


def test_refresh_token_rotation_invalidates_previous(client):
    tokens = _register(client, "rotate-college")
    first_refresh = tokens["refresh_token"]

    refreshed = client.post("/auth/refresh", json={"refresh_token": first_refresh})
    assert refreshed.status_code == 200, refreshed.text
    second_refresh = refreshed.json()["refresh_token"]
    assert second_refresh != first_refresh

    replay = client.post("/auth/refresh", json={"refresh_token": first_refresh})
    assert replay.status_code == 401

    # Reuse detection revokes the entire family — the rotated token is invalid too.
    family_revoked = client.post("/auth/refresh", json={"refresh_token": second_refresh})
    assert family_revoked.status_code == 401


def test_logout_revokes_refresh_token(client):
    tokens = _register(client, "logout-college")
    logout = client.post("/auth/logout", json={"refresh_token": tokens["refresh_token"]})
    assert logout.status_code == 204

    refresh = client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert refresh.status_code == 401


def test_auth_rate_limit_returns_429(client, monkeypatch):
    monkeypatch.setattr("app.core.rate_limit.settings.auth_rate_limit_per_minute", 2)

    for _ in range(2):
        resp = client.post(
            "/auth/login",
            json={"tenant_slug": "missing", "email": "nobody@x.edu", "password": "wrong"},
        )
        assert resp.status_code == 401

    blocked = client.post(
        "/auth/login",
        json={"tenant_slug": "missing", "email": "nobody@x.edu", "password": "wrong"},
    )
    assert blocked.status_code == 429
    assert blocked.headers.get("Retry-After") == "60"


def test_admin_can_provision_user_and_faculty_scope(client, superuser_connection):
    tokens = _register(client, "users-college")
    admin_token = tokens["access_token"]

    create = client.post(
        "/users",
        headers=_auth(admin_token),
        json={
            "email": "mentor@users-college.edu",
            "password": "supersecret1",
            "role": "faculty",
        },
    )
    assert create.status_code == 200, create.text
    faculty_id = create.json()["id"]

    scope = client.post(
        f"/users/{faculty_id}/scopes",
        headers=_auth(admin_token),
        json={"scope_type": "department", "scope_ref": "CSE"},
    )
    assert scope.status_code == 200, scope.text
    assert scope.json()["scope_ref"] == "CSE"

    listed = client.get(f"/users/{faculty_id}/scopes", headers=_auth(admin_token))
    assert listed.status_code == 200
    assert len(listed.json()) == 1


def test_non_admin_cannot_list_users(client):
    tokens = _register(client, "forbidden-college")
    admin_token = tokens["access_token"]

    faculty = client.post(
        "/users",
        headers=_auth(admin_token),
        json={"email": "f@forbidden-college.edu", "password": "supersecret1", "role": "faculty"},
    )
    assert faculty.status_code == 200

    login = client.post(
        "/auth/login",
        json={"tenant_slug": "forbidden-college", "email": "f@forbidden-college.edu", "password": "supersecret1"},
    )
    faculty_token = login.json()["access_token"]

    denied = client.get("/users", headers=_auth(faculty_token))
    assert denied.status_code == 403


def test_deactivating_user_revokes_refresh(client, superuser_connection):
    tokens = _register(client, "deact-college")
    admin_token = tokens["access_token"]

    create = client.post(
        "/users",
        headers=_auth(admin_token),
        json={"email": "temp@deact-college.edu", "password": "supersecret1", "role": "faculty"},
    )
    user_id = create.json()["id"]

    login = client.post(
        "/auth/login",
        json={"tenant_slug": "deact-college", "email": "temp@deact-college.edu", "password": "supersecret1"},
    )
    user_refresh = login.json()["refresh_token"]

    patch = client.patch(
        f"/users/{user_id}",
        headers=_auth(admin_token),
        json={"is_active": False},
    )
    assert patch.status_code == 200

    refresh = client.post("/auth/refresh", json={"refresh_token": user_refresh})
    assert refresh.status_code == 401

    active = superuser_connection.execute(
        text("SELECT is_active FROM users WHERE id = :id"), {"id": user_id}
    ).scalar_one()
    assert active is False
