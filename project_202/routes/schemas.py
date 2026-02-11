
import json
from typing import List, Optional
from pydantic import BaseModel, EmailStr, validator
from sqlalchemy import Column, Integer, String, BigInteger, Time, DECIMAL
from datetime import datetime, time


# schema models for user input validation
class Restaurant(BaseModel):
    rid: int
    name: str
    owner: int
    address: str
    zip: int
    phone: int
    opentime: str
    closetime: str
    description: str
    price: str
    rating: float
    status: str
    menu: str 
    menu_photo: str
    created_at : datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserOut(BaseModel):
    uid: int
    email: EmailStr
    username: str
    created:datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class LoginOutput(BaseModel):
    uid: int
    email: EmailStr

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    uid: Optional[int] = None
    user_type: Optional[str] = None


class RestaurantCreate(BaseModel):
    name: str
    address: str
    zip: int
    phone: int
    opentime: str
    closetime: str
    description: str
    price: str = "$$"  # Default value
    status: int = 1    # Default to open (1=open, 0=closed)
    menu: Optional[str] 
    menu_photo: str = ""  # Default empty string

    class Config:
        from_attributes = True

    @validator('opentime', 'closetime', pre=True)
    def convert_time_to_string(cls, v):
        if isinstance(v, time):
            return v.strftime("%H:%M")
        return v

class RestaurantOut(BaseModel):
    rid: int
    name: str
    owner: int
    address: str
    zip: int
    phone: int
    opentime: str
    closetime: str
    description: str
    price: str
    rating: float
    status: str
    menu: str = ""
    menu_photo: str = "" # Default value

    class Config:
        from_attributes = True
    @validator('opentime', 'closetime', pre=True)
    def convert_time_to_string(cls, v):
        if isinstance(v, time):
            return v.strftime("%H:%M")
        return v

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    zip: Optional[int] = None
    phone: Optional[int] = None
    opentime: Optional[str] = None
    closetime: Optional[str] = None
    description: Optional[str] = None
    price: Optional[str] = None
    status: Optional[int] = None
    menu: Optional[str] = None
    menu_photo: Optional[str] = None

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    rvid: int
    restaurant: int
    user: int
    rating: int
    text: str
    time: datetime
    replying: int
    photo: int

    class Config:
        from_attributes = True

class SearchRequest(BaseModel):
    textQuery: str
