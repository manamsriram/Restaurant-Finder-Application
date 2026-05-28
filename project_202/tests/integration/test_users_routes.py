from conftest import make_user


def test_get_all_users_returns_empty_list(client):
    response = client.get("/users/")

    assert response.status_code == 200
    assert response.json() == []


def test_get_all_users_returns_created_users(client, db_session):
    make_user(db_session, email="a@example.com", username="userone")
    make_user(db_session, email="b@example.com", username="usertwo")

    response = client.get("/users/")

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_user_by_id_returns_user(client, db_session):
    user = make_user(db_session)

    response = client.get(f"/users/{user.uid}")

    assert response.status_code == 200
    assert response.json()["email"] == user.email
    assert response.json()["username"] == user.username


def test_get_user_by_id_returns_404_for_missing_user(client):
    response = client.get("/users/99999")

    assert response.status_code == 404


def test_create_user_rejects_duplicate_username(client):
    payload = {"email": "first@example.com", "password": "StrongPass123", "username": "sharedname"}
    client.post("/users/create_users", json=payload)

    second = client.post(
        "/users/create_users",
        json={"email": "second@example.com", "password": "StrongPass123", "username": "sharedname"},
    )

    assert second.status_code == 400
    assert second.json()["detail"] == "Username already taken"


def test_create_owner_returns_201(client, db_session):
    import models

    payload = {"email": "owner@example.com", "password": "StrongPass123", "username": "owneruser"}

    response = client.post("/users/create_owner", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == payload["email"]

    db_user = db_session.query(models.User).filter(models.User.email == payload["email"]).first()
    assert db_user.user_type == "owner"
    assert db_user.status == "pending"


def test_create_owner_rejects_duplicate_email(client):
    payload = {"email": "dup@example.com", "password": "StrongPass123", "username": "firstowner"}
    client.post("/users/create_owner", json=payload)

    second = client.post(
        "/users/create_owner",
        json={"email": "dup@example.com", "password": "StrongPass123", "username": "secondowner"},
    )

    assert second.status_code == 400
    assert second.json()["detail"] == "Email already registered"
