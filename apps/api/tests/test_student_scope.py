"""Student self-scope: linked users may only read their own canonical record."""

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


def _insert_student(superuser_connection, tenant_id, roll_no: str):
    sid = superuser_connection.execute(
        text(
            "INSERT INTO students (tenant_id, canonical_roll_no, name) VALUES (:t, :r, :r) RETURNING id"
        ),
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


def test_student_can_read_own_student_360(client, superuser_connection):
    slug = "scope-student-360-college"
    _register(client, slug)
    tenant_id = _tenant_id_for_slug(superuser_connection, slug)
    own_id = _insert_student(superuser_connection, tenant_id, "SELF001")
    other_id = _insert_student(superuser_connection, tenant_id, "OTHER001")
    user_id = _insert_user(superuser_connection, tenant_id, "stu@scope.edu", "student")
    _link_user_to_student(superuser_connection, user_id, own_id)
    token = _token_for(tenant_id, user_id, "student")

    own_resp = client.get(f"/students/{own_id}", headers=_auth(token))
    assert own_resp.status_code == 200, own_resp.text
    assert own_resp.json()["canonical_roll_no"] == "SELF001"

    other_resp = client.get(f"/students/{other_id}", headers=_auth(token))
    assert other_resp.status_code == 404


def test_student_can_read_own_risk_detail(client, superuser_connection):
    slug = "scope-student-risk-college"
    _register(client, slug)
    tenant_id = _tenant_id_for_slug(superuser_connection, slug)
    own_id = _insert_student(superuser_connection, tenant_id, "RISKSELF001")
    other_id = _insert_student(superuser_connection, tenant_id, "RISKOTHER001")
    user_id = _insert_user(superuser_connection, tenant_id, "riskstu@scope.edu", "student")
    _link_user_to_student(superuser_connection, user_id, own_id)
    token = _token_for(tenant_id, user_id, "student")

    own_resp = client.get(f"/risk/students/{own_id}", headers=_auth(token))
    assert own_resp.status_code == 200, own_resp.text
    assert own_resp.json()["student_id"] == str(own_id)

    other_resp = client.get(f"/risk/students/{other_id}", headers=_auth(token))
    assert other_resp.status_code == 404


def test_student_without_link_cannot_read_any_student_360(client, superuser_connection):
    slug = "scope-unlinked-college"
    _register(client, slug)
    tenant_id = _tenant_id_for_slug(superuser_connection, slug)
    student_id = _insert_student(superuser_connection, tenant_id, "UNLINKED001")
    user_id = _insert_user(superuser_connection, tenant_id, "unlinked@scope.edu", "student")
    token = _token_for(tenant_id, user_id, "student")

    resp = client.get(f"/students/{student_id}", headers=_auth(token))
    assert resp.status_code == 404


def _insert_department(superuser_connection, tenant_id, code: str):
    return superuser_connection.execute(
        text("INSERT INTO departments (tenant_id, code, name) VALUES (:t, :c, :c) RETURNING id"),
        {"t": tenant_id, "c": code},
    ).scalar_one()


def _insert_programme(superuser_connection, tenant_id, code: str, department_id):
    return superuser_connection.execute(
        text(
            "INSERT INTO programmes (tenant_id, code, name, department_id) VALUES (:t, :c, :c, :d) RETURNING id"
        ),
        {"t": tenant_id, "c": code, "d": department_id},
    ).scalar_one()


def _insert_faculty_scope(superuser_connection, tenant_id, user_id, scope_type: str, scope_ref: str):
    superuser_connection.execute(
        text(
            "INSERT INTO faculty_scopes (tenant_id, user_id, scope_type, scope_ref) "
            "VALUES (:t, :u, :st, :sr)"
        ),
        {"t": tenant_id, "u": user_id, "st": scope_type, "sr": scope_ref},
    )
    superuser_connection.commit()


def test_faculty_student_360_out_of_scope_is_404(client, superuser_connection):
    slug = "scope-faculty-360-college"
    _register(client, slug)
    tenant_id = _tenant_id_for_slug(superuser_connection, slug)
    superuser_connection.commit()

    dept_cse = _insert_department(superuser_connection, tenant_id, "CSE")
    dept_ece = _insert_department(superuser_connection, tenant_id, "ECE")
    superuser_connection.commit()
    prog_cse = _insert_programme(superuser_connection, tenant_id, "BTECH-CSE", dept_cse)
    prog_ece = _insert_programme(superuser_connection, tenant_id, "BTECH-ECE", dept_ece)
    superuser_connection.commit()
    student_cse = _insert_student(superuser_connection, tenant_id, "FAC-CSE-1")
    superuser_connection.execute(
        text("UPDATE students SET programme_id = :p WHERE id = :s"),
        {"p": prog_cse, "s": student_cse},
    )
    student_ece = _insert_student(superuser_connection, tenant_id, "FAC-ECE-1")
    superuser_connection.execute(
        text("UPDATE students SET programme_id = :p WHERE id = :s"),
        {"p": prog_ece, "s": student_ece},
    )
    superuser_connection.commit()

    faculty_id = _insert_user(superuser_connection, tenant_id, "fac360@scope.edu", "faculty")
    _insert_faculty_scope(superuser_connection, tenant_id, faculty_id, "department", "CSE")
    faculty_token = _token_for(tenant_id, faculty_id, "faculty")

    in_scope = client.get(f"/students/{student_cse}", headers=_auth(faculty_token))
    assert in_scope.status_code == 200, in_scope.text

    out_of_scope = client.get(f"/students/{student_ece}", headers=_auth(faculty_token))
    assert out_of_scope.status_code == 404
