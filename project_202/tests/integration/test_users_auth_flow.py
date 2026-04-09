def test_create_user_and_login_success(client):
    create_payload = {
        "email": "jane@example.com",
        "password": "StrongPassword123",
        "username": "jane",
    }

    create_response = client.post("/users/create_users", json=create_payload)

    assert create_response.status_code == 201
    body = create_response.json()
    assert body["email"] == create_payload["email"]
    assert body["username"] == create_payload["username"]
    assert "uid" in body

    login_response = client.post(
        "/auth/login",
        data={"username": create_payload["email"], "password": create_payload["password"]},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert login_response.status_code == 200
    login_body = login_response.json()
    assert "login_access_token" in login_body
    assert login_body["token_type"] == "bearer"
    assert login_body["user_info"]["email"] == create_payload["email"]


def test_create_user_rejects_duplicate_email(client):
    payload = {
        "email": "duplicate@example.com",
        "password": "StrongPassword123",
        "username": "first-user",
    }

    first = client.post("/users/create_users", json=payload)
    assert first.status_code == 201

    second_payload = {
        "email": payload["email"],
        "password": "AnotherPassword456",
        "username": "second-user",
    }
    second = client.post("/users/create_users", json=second_payload)

    assert second.status_code == 400
    assert second.json()["detail"] == "Email already registered"


def test_login_fails_for_wrong_password(client):
    payload = {
        "email": "authfail@example.com",
        "password": "StrongPassword123",
        "username": "auth-fail",
    }
    create = client.post("/users/create_users", json=payload)
    assert create.status_code == 201

    login_response = client.post(
        "/auth/login",
        data={"username": payload["email"], "password": "wrong-password"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert login_response.status_code == 403
    assert login_response.json()["detail"] == "Wrong credentials!"
