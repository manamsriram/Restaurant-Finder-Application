import json

from routes.routers.owners import calculate_price_range


def test_calculate_price_range_low_cost_menu_returns_single_dollar():
    menu = json.dumps([
        {
            "category": "Breakfast",
            "items": [
                {"name": "Coffee", "price": 4.5},
                {"name": "Bagel", "price": 6.0},
            ],
        }
    ])

    assert calculate_price_range(menu) == "$"


def test_calculate_price_range_mid_cost_menu_returns_double_dollar():
    menu = json.dumps([
        {
            "category": "Lunch",
            "items": [
                {"name": "Burger", "price": 14.0},
                {"name": "Salad", "price": 16.0},
            ],
        }
    ])

    assert calculate_price_range(menu) == "$$"


def test_calculate_price_range_handles_invalid_json_with_default():
    assert calculate_price_range("{not-json") == "$$"
