from sqlalchemy import Column, Integer, String, Float, BigInteger, TIMESTAMP, Text, CHAR, ForeignKey
from sqlalchemy.sql import func
from .db_config import Base

class User(Base):
    __tablename__ = "user"

    uid = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(15), unique=True, nullable=False)
    email = Column(String(45), unique=True, nullable=False)
    password = Column(String(70), nullable=False)
    user_type = Column(CHAR(15))
    phone = Column(BigInteger)
    status = Column(String(20))
    photo = Column(String(255))
    created = Column(TIMESTAMP, server_default=func.now())
    updated = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

class Restaurant(Base):
    __tablename__ = "restaurant"

    rid = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    address = Column(String(200))
    city = Column(String(50))
    state = Column(String(50))
    zip_code = Column(String(10))
    latitude = Column(Float)
    longitude = Column(Float)
    phone = Column(BigInteger)
    website = Column(String(255))
    overall_rating = Column(Float, default=0)
    price_range = Column(String(10))
    owner_id = Column(Integer, ForeignKey("user.uid"))
    opentime = Column(String(10))
    closetime = Column(String(10))
    description = Column(Text)
    status = Column(String(20), default='1')
    menu = Column(Text)
    menu_photo = Column(String(255))
    created = Column(TIMESTAMP, server_default=func.now())
    updated = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

class Cuisine(Base):
    __tablename__ = "cuisine"

    cid = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    rid = Column(Integer, ForeignKey("restaurant.rid"))

class Photo(Base):
    __tablename__ = "photo"

    pid = Column(Integer, primary_key=True, autoincrement=True)
    url = Column(String(255), nullable=False)
    rid = Column(Integer, ForeignKey("restaurant.rid"))
    uid = Column(Integer, ForeignKey("user.uid"))
    created = Column(TIMESTAMP, server_default=func.now())

class Review(Base):
    __tablename__ = "review"

    rvid = Column(Integer, primary_key=True, autoincrement=True)
    rating = Column(Float, nullable=False)
    comment = Column(Text)
    rid = Column(Integer, ForeignKey("restaurant.rid"))
    uid = Column(Integer, ForeignKey("user.uid"))
    created = Column(TIMESTAMP, server_default=func.now())
    updated = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())