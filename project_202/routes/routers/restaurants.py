from datetime import datetime
from http.client import HTTPException
import json
from typing import Optional, Text
from fastapi import FastAPI, APIRouter, Depends, status, requests
from fastapi.exceptions import HTTPException
import requests
import pymysql.cursors
import pymysql
from sqlalchemy.orm import Session
import googlemaps
import models, schemas, oauth2
from db_config import get_db
from config import settings

# Create a router object
router = APIRouter(
    prefix="/restaurants",
    tags=['Restaurants']
)

# fetch restaurant details from database using restaurant_id
@router.get("/{restaurant_id}")
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.rid == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    photos = db.query(models.Photo).filter(models.Photo.rid == restaurant_id).all()
    return {
        "rid": restaurant.rid,
        "name": restaurant.name,
        "address": restaurant.address,
        "city": restaurant.city,
        "state": restaurant.state,
        "zip_code": restaurant.zip_code,
        "phone": restaurant.phone,
        "website": restaurant.website,
        "overall_rating": restaurant.overall_rating,
        "price_range": restaurant.price_range,
        "opentime": restaurant.opentime,
        "closetime": restaurant.closetime,
        "description": restaurant.description,
        "status": restaurant.status,
        "menu": restaurant.menu,
        "photos": [{"pid": p.pid, "url": p.url} for p in photos],
    }

# fetch menu for a restaurant from database using restaurant_id
@router.get("/{restaurant_id}/menu")
def get_menu(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.rid == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if not restaurant.menu:
        return {}
    try:
        return json.loads(restaurant.menu)
    except json.JSONDecodeError:
        return {}

# fetch reviews for a restaurant from database using restaurant_id
@router.get("/{restaurant_id}/reviews")
def get_reviews(restaurant_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review, models.User.username)\
        .join(models.User, models.Review.uid == models.User.uid)\
        .filter(models.Review.rid == restaurant_id)\
        .all()
    
    return [
        {
            "rvid": review.rvid,
            "rating": review.rating,
            "comment": review.comment,
            "rid": review.rid,
            "uid": review.uid,
            "created": review.created,
            "username": username,
        } for review, username in reviews
    ]


# get average rating for a restaurant using restaurant_id
@router.get("/{restaurant_id}/rating")
def get_rating(restaurant_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.rid == restaurant_id).all()
    total_rating = 0
    for review in reviews:
        total_rating += review.rating
    if len(reviews) == 0:
        return 0
    return total_rating / len(reviews)

# create a review while logged in, owners and admins cannot create reviews, only users
@router.post("/{restaurant_id}/create_review")
def create_review(restaurant_id: int, review: schemas.ReviewCreate, db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)):   
    if current_user.user_type == "owner" or current_user.user_type == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins cannot create reviews"
        )
    
    new_review = models.Review(rid=restaurant_id, uid=current_user.uid, rating=review.rating, comment=review.comment, created=datetime.now())
    db.add(new_review)
    db.flush()  # flush so new review is included in the count

    # Recalculate overall_rating as average of all reviews for this restaurant
    all_reviews = db.query(models.Review).filter(models.Review.rid == restaurant_id).all()
    total = sum(r.rating for r in all_reviews)
    avg_rating = round(total / len(all_reviews), 1) if all_reviews else 0

    restaurant = db.query(models.Restaurant).filter(models.Restaurant.rid == restaurant_id).first()
    if restaurant:
        restaurant.overall_rating = avg_rating

    db.commit()
    db.refresh(new_review)
    return new_review


@router.get("/google-places/{zipcode}")
async def google_places_proxy(zipcode: int):
    api_key = settings.MAPS_KEY
    zip_code_int = int(zipcode)
    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+{zip_code_int}&key={api_key}"

    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))