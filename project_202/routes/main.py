from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
from db_config import get_db
from routers import restaurants, users, auth, owners
from config import settings

app = FastAPI()

cors_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(',') if origin.strip()]
if not cors_origins:
    cors_origins = ['*']
allow_all_origins = '*' in cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else cors_origins,
    allow_credentials=False if allow_all_origins else True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(restaurants.router)
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(owners.router)

@app.get("/restaurants")
async def get_all_restaurants(db: Session = Depends(get_db)):
    try:
        restaurants_list = db.query(models.Restaurant).all()
        result = []
        for r in restaurants_list:
            result.append({
                "rid": r.rid,
                "name": r.name,
                "address": r.address,
                "city": r.city,
                "state": r.state,
                "zip_code": r.zip_code,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "phone": r.phone,
                "website": r.website,
                "overall_rating": r.overall_rating,
                "price_range": r.price_range,
                "owner_id": r.owner_id,
                "opentime": r.opentime,
                "closetime": r.closetime,
                "description": r.description,
                "status": r.status,
                "menu": r.menu,
                "menu_photo": r.menu_photo,
            })
        return {"restaurants": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))