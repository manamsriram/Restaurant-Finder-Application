from http.client import HTTPException
import json
from typing import Optional
from fastapi import FastAPI, APIRouter, Depends
import pymysql.cursors
import pymysql
from sqlalchemy.orm import Session
from .. import models, schemas
from .. db_config import get_db


# Create a router object
router = APIRouter(
    prefix="/restaurants",
    tags=['Restaurants']
)

# fetch all restaurant from database
@router.get("/")
def get_all_restaurants(db: Session = Depends(get_db)):
    restaurants = db.query(models.Restaurant).all()
    print(restaurants)
    return restaurants

# fetch restaurant details from database using restaurant_id
@router.get("/{restaurant_id}")
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.rid == restaurant_id).first()
    return restaurant

# fetch menu items from database using restaurant_id
# Endpoint to return the menu in JSON format
@router.get("/{restaurant_id}/menu")
def get_menu(restaurant_id: int, db: Session = Depends(get_db)):
    # Retrieving the restaurant from the database
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.rid == restaurant_id).first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    try:
        # Parse the JSON string from the database
        menu_json = json.loads(restaurant.menu)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse menu JSON")

    # Return the menu as a JSON response
    return menu_json

# fetch reviews for a restaurant from database using restaurant_id
# using diff db now, foreign keys to be implemented
@router.get("/reviews")
def get_reviews(db: Session = Depends(get_db)):
    #reviews = db.query(models.Review)
    print("in get_reviews")
    return print("in get_reviews")
    