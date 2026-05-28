from conftest import make_user, auth_headers


def _create_restaurant(db_session, menu: str):
    import models

    restaurant = models.Restaurant(
        name="Test Kitchen",
        address="123 Main St",
        city="Austin",
        state="TX",
        zip_code="78701",
        overall_rating=0,
        menu=menu,
    )
    db_session.add(restaurant)
    db_session.commit()
    db_session.refresh(restaurant)
    return restaurant


def test_get_rating_returns_zero_when_no_reviews(client, db_session):
    restaurant = _create_restaurant(db_session, menu='[{"items": []}]')

    response = client.get(f"/restaurants/{restaurant.rid}/rating")

    assert response.status_code == 200
    assert response.json() == 0


def test_get_menu_returns_parsed_menu_json(client, db_session):
    menu = '[{"category": "Lunch", "items": [{"name": "Wrap", "price": 11}]}]'
    restaurant = _create_restaurant(db_session, menu=menu)

    response = client.get(f"/restaurants/{restaurant.rid}/menu")

    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert response.json()[0]["category"] == "Lunch"


def test_get_menu_returns_empty_dict_for_invalid_menu_json(client, db_session):
    restaurant = _create_restaurant(db_session, menu="not-json")

    response = client.get(f"/restaurants/{restaurant.rid}/menu")

    assert response.status_code == 200
    assert response.json() == {}


def test_get_restaurant_returns_404_for_unknown_id(client):
    response = client.get("/restaurants/99999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Restaurant not found"


def test_get_restaurant_returns_details_with_photos(client, db_session):
    restaurant = _create_restaurant(db_session, menu="[]")

    response = client.get(f"/restaurants/{restaurant.rid}")

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Test Kitchen"
    assert body["city"] == "Austin"
    assert isinstance(body["photos"], list)


def test_get_all_restaurants_returns_list(client, db_session):
    _create_restaurant(db_session, menu="[]")

    response = client.get("/restaurants")

    assert response.status_code == 200
    data = response.json()
    assert "restaurants" in data
    assert len(data["restaurants"]) >= 1


def test_get_reviews_returns_empty_list_when_no_reviews(client, db_session):
    restaurant = _create_restaurant(db_session, menu="[]")

    response = client.get(f"/restaurants/{restaurant.rid}/reviews")

    assert response.status_code == 200
    assert response.json() == []


def test_create_review_requires_authentication(client, db_session):
    restaurant = _create_restaurant(db_session, menu="[]")

    response = client.post(
        f"/restaurants/{restaurant.rid}/create_review",
        json={"rating": 4.0, "comment": "Great food"},
    )

    assert response.status_code == 401


def test_create_review_adds_review_and_updates_rating(client, db_session):
    restaurant = _create_restaurant(db_session, menu="[]")
    user = make_user(db_session)
    headers = auth_headers(user)

    response = client.post(
        f"/restaurants/{restaurant.rid}/create_review",
        json={"rating": 4.0, "comment": "Tasty!"},
        headers=headers,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["rating"] == 4.0
    assert body["comment"] == "Tasty!"

    rating_response = client.get(f"/restaurants/{restaurant.rid}/rating")
    assert rating_response.status_code == 200
    assert rating_response.json() == 4.0


def test_owner_cannot_create_review(client, db_session):
    restaurant = _create_restaurant(db_session, menu="[]")
    owner = make_user(db_session, email="owner@example.com", username="owneruser", user_type="owner")
    headers = auth_headers(owner)

    response = client.post(
        f"/restaurants/{restaurant.rid}/create_review",
        json={"rating": 5.0, "comment": "My own restaurant is great"},
        headers=headers,
    )

    assert response.status_code == 403
