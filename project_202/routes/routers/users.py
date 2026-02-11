
from datetime import datetime
from fastapi import HTTPException, Response, status, Depends, APIRouter
from sqlalchemy.orm import Session
from .. import models, schemas
from .. db_config import get_db
from .. import utils

# Create a router object
router = APIRouter(
    prefix="/users",
    tags=['Users']
)

#get all users
@router.get("/", response_model=list[schemas.UserOut])
def get_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users

#get user by id
@router.get("/{uid}", response_model=schemas.UserOut)
def get_user_by_id(uid: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.uid == uid).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id {uid} not found")
    return user


@router.post("/create_users", status_code=status.HTTP_201_CREATED, response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_username = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Hash password
    hashed_password = utils.get_password_hash(user.password)
    
    # Create new user
    new_user = models.User(
        email=user.email,
        password=hashed_password,
        username=user.username,
        user_type="user",
        status="active",
        created=datetime.now(),
        updated=datetime.now()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/create_owner", status_code=status.HTTP_201_CREATED, response_model=schemas.UserOut)
def create_owner(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_username = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Hash password
    hashed_password = utils.get_password_hash(user.password)
    
    # Create new owner
    new_user = models.User(
        email=user.email,
        password=hashed_password,
        username=user.username,
        user_type="owner",
        status="pending",  # Owners need approval
        created=datetime.now(),
        updated=datetime.now()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# create admin
@router.post("/create_admin", status_code=status.HTTP_201_CREATED, response_model=schemas.UserOut)
def create_admin(user: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed_password = utils.get_password_hash(user.password)
    user.password = hashed_password
    new_user = models.User(email=user.email, password=user.password, username=user.username, user_type="admin", created=datetime.now())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
