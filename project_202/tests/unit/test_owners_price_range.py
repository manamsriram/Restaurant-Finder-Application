import json

from routers.owners import calculate_price_range


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


def test_calculate_price_range_high_cost_menu_returns_triple_dollar():
    menu = json.dumps([
        {
            "category": "Dinner",
            "items": [
                {"name": "Lobster", "price": 45.0},
                {"name": "Wagyu", "price": 85.0},
            ],
        }
    ])

    assert calculate_price_range(menu) == "$$$"


def test_calculate_price_range_empty_items_list_returns_default():
    menu = json.dumps([{"category": "Empty", "items": []}])

    assert calculate_price_range(menu) == "$$"


def test_calculate_price_range_items_missing_price_field_returns_default():
    menu = json.dumps([
        {"category": "Misc", "items": [{"name": "Mystery dish"}]}
    ])

    assert calculate_price_range(menu) == "$$"


def test_calculate_price_range_multi_category_averages_all_items():
    menu = json.dumps([
        {"category": "Cheap", "items": [{"name": "Bread", "price": 2.0}]},
        {"category": "Expensive", "items": [{"name": "Steak", "price": 36.0}]},
    ])

    assert calculate_price_range(menu) == "$$"
