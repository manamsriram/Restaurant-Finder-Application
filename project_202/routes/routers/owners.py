
import json
from fastapi import APIRouter, Depends, HTTPException, status
import pymysql
from sqlalchemy.orm import Session
from .. import models, schemas, oauth2
from .. db_config import get_db
from datetime import datetime
from typing import List

# Create a router object
router = APIRouter(
    prefix="/owner",
    tags=['Owners']
)

# Business Owner Endpoints
@router.get("/view-listings", response_model=List[schemas.RestaurantOut])
def view_owned_listings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.user_type != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only restaurant owners can view their listings"
        )
    
    listings = db.query(models.Restaurant).filter(
        models.Restaurant.owner == current_user.uid
    ).all()

    # Convert time objects to strings and handle None values
    for listing in listings:
        if listing.menu_photo is None:
            listing.menu_photo = ""
        if listing.menu is None:
            listing.menu = ""

    return listings

def calculate_price_range(menu_items):
    try:
        menu_data = json.loads(menu_items)
        prices = []
        
        for category in menu_data:
            if 'items' in category:
                for item in category['items']:
                    if 'price' in item:
                        prices.append(float(item['price']))
        
        if not prices:
            return "$$"
            
        avg_price = sum(prices) / len(prices)
        
        if avg_price < 10:
            return "$"
        elif avg_price < 20:
            return "$$"
        return "$$$"
    except:
        return "$$"

@router.post("/add-listing", response_model=schemas.RestaurantCreate)
def create_restaurant(
    restaurant: schemas.RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.user_type != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only restaurant owners can create listings"
        )

    # Calculate price range based on menu
    price_range = calculate_price_range(restaurant.menu)
    
    existing_restaurant = db.query(models.Restaurant).filter(
        models.Restaurant.name == restaurant.name,
        models.Restaurant.address == restaurant.address
    ).first()
    
    if existing_restaurant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A restaurant with this name and address already exists"
        )
    
    # Convert time strings to Time objects
    try:
        opentime = datetime.strptime(restaurant.opentime, "%H:%M").time()
        closetime = datetime.strptime(restaurant.closetime, "%H:%M").time()
        if opentime >= closetime:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Opening time must be before closing time"
            )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid time format. Use HH:MM format"
        )
    
    new_restaurant = models.Restaurant(
        name=restaurant.name,
        owner=current_user.uid,
        address=restaurant.address,
        zip=restaurant.zip,
        phone=restaurant.phone,
        opentime=opentime,
        closetime=closetime,
        description=restaurant.description,
        status="1",  # Default value
        rating=0.0,     # Default value
        price=price_range,     
        menu=restaurant.menu, 
        menu_photo=restaurant.menu_photo   
    )
    
    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)
    return new_restaurant

@router.put("/update-listing/{listing_id}", response_model=schemas.RestaurantOut)
def update_restaurant(
    listing_id: int,
    restaurant: schemas.RestaurantUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.user_type != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only restaurant owners can update listings"
        )
    
    restaurant_query = db.query(models.Restaurant).filter(
        models.Restaurant.rid == listing_id,
        models.Restaurant.owner == current_user.uid
    )
    
    existing_restaurant = restaurant_query.first()
    
    if not existing_restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found or you don't have permission to update it"
        )
    
    update_data = restaurant.dict(exclude_unset=True)

    # Update price range if menu is being updated
    if 'menu' in update_data:
        update_data['price'] = calculate_price_range(update_data['menu'])
    
    # Convert time strings to Time objects if they exist
    if 'opentime' in update_data:
        try:
            update_data['opentime'] = datetime.strptime(update_data['opentime'], "%H:%M").time()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid opentime format. Use HH:MM format"
            )
    
    if 'closetime' in update_data:
        try:
            update_data['closetime'] = datetime.strptime(update_data['closetime'], "%H:%M").time()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid closetime format. Use HH:MM format"
            )
    # Convert None values to empty strings
    if 'menu_photo' in update_data and update_data['menu_photo'] is None:
        update_data['menu_photo'] = ""
    if 'menu' in update_data and update_data['menu'] is None:
        update_data['menu'] = ""
    
    restaurant_query.update(update_data, synchronize_session=False)
    db.commit()
    
    return restaurant_query.first()

@router.delete("/delete-listing/{listing_id}")
def delete_restaurant(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.user_type != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only restaurant owners can delete listings"
        )
    
    restaurant = db.query(models.Restaurant).filter(
        models.Restaurant.rid == listing_id,
        models.Restaurant.owner == current_user.uid
    ).first()
    
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found or you don't have permission to delete it"
        )
    
    if restaurant.owner != current_user.uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this restaurant"
        )

    db.query(models.Review).filter(models.Review.restaurant == listing_id).delete()

    db.delete(restaurant)
    db.commit()
    
    return {"message": "Restaurant deleted successfully"}
	
# delete listing by id if user_type = "admin" and signed in
@router.delete("/admin-delete-listing/{listing_id}")
def delete_listing(listing_id: int, db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)):
	# Fetch the existing restaurant
	existing_restaurant = db.query(models.Restaurant).filter(models.Restaurant.rid == listing_id).first()

	if not existing_restaurant:
		raise HTTPException(
			status_code=404,
			detail=f"Restaurant with ID {listing_id} not found",
		)
	
	# Ensure the current user is an admin
	if current_user.user_type != "admin":
		raise HTTPException(
			status_code=403,
			detail="Not authorized to delete this listing",
		)

	# Delete the record
	db.query(models.Restaurant).filter(models.Restaurant.rid == listing_id).delete()
	db.commit()
	return {"message": "Listing deleted successfully"}

# remove duplicate listings and keep the one created first only as admin
@router.delete("/remove-duplicates")
def remove_duplicates(db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)):
	# Ensure the current user is an admin
	if current_user.user_type != "admin":
		raise HTTPException(
			status_code=403,
			detail="Not authorized to remove duplicates",
		)

	# Fetch all listings
	listings = db.query(models.Restaurant).all()

	# Group listings by name
	listing_groups = {}
	for listing in listings:
		if listing.name not in listing_groups:
			listing_groups[listing.name] = []
		listing_groups[listing.name].append(listing)

	# Remove duplicates
	for group in listing_groups.values():
		if len(group) > 1:
			# Sort by rid in ascending order
			group.sort(key=lambda x: x.rid)
			# Delete all but the first
			for listing in group[1:]:
				db.delete(listing)
	
	db.commit()
	return {"message": "Duplicates removed successfully"}
