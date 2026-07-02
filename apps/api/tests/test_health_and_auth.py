def test_health_liveness(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_db_roundtrip(client):
    response = client.get("/health/db")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_register_issues_jwt_and_login_works(client):
    register_resp = client.post(
        "/auth/register",
        json={
            "tenant_name": "Test College",
            "tenant_slug": "test-college",
            "admin_email": "admin@test-college.edu",
            "admin_password": "supersecret1",
        },
    )
    assert register_resp.status_code == 200
    body = register_resp.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["token_type"] == "bearer"

    login_resp = client.post(
        "/auth/login",
        json={
            "tenant_slug": "test-college",
            "email": "admin@test-college.edu",
            "password": "supersecret1",
        },
    )
    assert login_resp.status_code == 200
    assert login_resp.json()["access_token"]


def test_login_wrong_password_is_rejected(client):
    client.post(
        "/auth/register",
        json={
            "tenant_name": "Other College",
            "tenant_slug": "other-college",
            "admin_email": "admin@other-college.edu",
            "admin_password": "supersecret1",
        },
    )
    response = client.post(
        "/auth/login",
        json={
            "tenant_slug": "other-college",
            "email": "admin@other-college.edu",
            "password": "wrong-password",
        },
    )
    assert response.status_code == 401


def test_duplicate_tenant_slug_is_rejected(client):
    payload = {
        "tenant_name": "Dup College",
        "tenant_slug": "dup-college",
        "admin_email": "admin@dup-college.edu",
        "admin_password": "supersecret1",
    }
    first = client.post("/auth/register", json=payload)
    assert first.status_code == 200
    second = client.post("/auth/register", json={**payload, "admin_email": "other@dup-college.edu"})
    assert second.status_code == 409


def test_me_returns_role(client):
    register_resp = client.post(
        "/auth/register",
        json={
            "tenant_name": "Me College",
            "tenant_slug": "me-college",
            "admin_email": "admin@me-college.edu",
            "admin_password": "supersecret1",
        },
    )
    token = register_resp.json()["access_token"]
    me_resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    body = me_resp.json()
    assert body["role"] == "admin"
    assert body["email"] == "admin@me-college.edu"
    assert body["department_codes"] == []


def test_hod_me_includes_department_scope(client, superuser_connection):
    from sqlalchemy import text

    from app.core.security import create_access_token

    slug = "hod-scope-college"
    client.post(
        "/auth/register",
        json={
            "tenant_name": slug,
            "tenant_slug": slug,
            "admin_email": f"admin@{slug}.edu",
            "admin_password": "supersecret1",
        },
    )
    tenant_id = superuser_connection.execute(
        text("SELECT id FROM tenants WHERE slug = :s"), {"s": slug}
    ).scalar_one()
    hod_id = superuser_connection.execute(
        text(
            "INSERT INTO users (tenant_id, email, password_hash, role) "
            "VALUES (:t, 'hod@hod-scope-college.edu', 'x', 'hod') RETURNING id"
        ),
        {"t": tenant_id},
    ).scalar_one()
    superuser_connection.execute(
        text(
            "INSERT INTO faculty_scopes (tenant_id, user_id, scope_type, scope_ref) "
            "VALUES (:t, :u, 'department', 'CSE')"
        ),
        {"t": tenant_id, "u": hod_id},
    )
    superuser_connection.commit()

    token = create_access_token(hod_id, tenant_id, "hod")
    me_resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["role"] == "hod"
    assert me_resp.json()["department_codes"] == ["CSE"]
