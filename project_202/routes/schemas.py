from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, BigInteger, Time, DECIMAL


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
