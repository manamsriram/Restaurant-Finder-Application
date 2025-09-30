from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Review(BaseModel):
    id: int
    rating: int
    comment: str
    date_posted: str

# dummy data as a review for a restaurant
my_review = [{"id": 1, "rating": 5, "comment" : "Great food and service", "date_posted": "2021-01-01"}]

# User Endpoints
@app.get("/search-restaurants")
def search_restaurants():
	return {"message": "Search restaurants"}

@app.get("/restaurant/{restaurant_id}")
def view_restaurant_details(restaurant_id: int):
	return {"message": f"View details for restaurant {restaurant_id}"}

@app.post("/restaurant/{restaurant_id}/review")
def submit_review(restaurant_id: int):
	return {"message": f"Submit review for restaurant {restaurant_id}"}

@app.get("/search-restaurants/location")
def search_restaurants_by_location():
	return {"message": "Search restaurants by location"}

@app.post("/restaurant/{restaurant_id}/comment")
def make_comment(restaurant_id: int):
    return {"message": f"Make comment for restaurant {restaurant_id}"}

@app.get("/restaurant/reviews")
def view_reviews():
    return {"review": my_review}