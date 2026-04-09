def _create_restaurant(db_session, menu: str):
    from routes import models

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


def test_get_menu_returns_500_for_invalid_menu_json(client, db_session):
    restaurant = _create_restaurant(db_session, menu="not-json")

    response = client.get(f"/restaurants/{restaurant.rid}/menu")

    assert response.status_code == 500
    assert response.json()["detail"] == "Failed to parse menu JSON"
