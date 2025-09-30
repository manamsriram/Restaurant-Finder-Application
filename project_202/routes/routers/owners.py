import random
from fastapi import FastAPI, status
from pydantic import BaseModel

app = FastAPI()
class Restaurant(BaseModel):
    id: int
    name: str
    location: str
    owner: str
    contact: str
    hours: str
    description: str
    photos: str
    price_range: str
    latitude: float
    longitude: float
    rating: float
    is_open: bool
    date_added: str
    date_updated: str

listings = []

# Business Owner Endpoints
@app.post("/owner/add-listing", status_code=status.HTTP_201_CREATED)
def add_new_listing(new_listing: Restaurant):
	new_listing = new_listing.dict()
	new_listing["id"] = random.randint(1, 1000)
	listings.append(new_listing)
	return {"message": "New listing added", "new_listing": new_listing}
	

@app.put("/owner/update-listing/{listing_id}")
def update_listing(listing_id: int):
	return {"message": f"Update listing {listing_id}"}

@app.put("/owner/update-description/{listing_id}")
def update_description_and_photos(listing_id: int):
	return {"message": f"Update description and photos for listing {listing_id}"}

@app.get("/owner/view-listings")
def view_owned_listings():
	return {"listings": listings}
	print(listings)

@app.delete("/owner/delete-listing/{listing_id}")
def delete_listing(listing_id: int):
	return {"message": f"Delete listing {listing_id}"}