from http.client import HTTPException
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv
import pymysql
from pydantic import BaseModel
from fastapi import FastAPI
import pymysql.cursors

app = FastAPI()

# Load environment variables
load_dotenv()

# access environment variables
username = os.getenv('DB_USERNAME')
password = os.getenv('DB_PASSWORD')
host = os.getenv('DB_HOST')
port = os.getenv('DB_PORT')
database_name = os.getenv('DB_NAME')
database_url_override = os.getenv('DATABASE_URL')

if database_url_override:
    SQLALCHEMY_DATABASE_URL = database_url_override
else:
    SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{username}:{password}@{host}:{port}/{database_name}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {},
)

sessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()
