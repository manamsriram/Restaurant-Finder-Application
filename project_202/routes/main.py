from fastapi import FastAPI, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models
from .db_config import get_db, Base, engine
from datetime import datetime, timedelta
import bcrypt
import jwt
from .models import User
from passlib.context import CryptContext
from dotenv import load_dotenv
import os
from sqlalchemy.exc import IntegrityError
from fastapi import Request
import json
from .routers import restaurants, users, auth, owners

# Get the absolute path of the directory containing your script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Construct path to .env file
env_path = os.path.join(BASE_DIR, '.env')
load_dotenv(dotenv_path=env_path)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)
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