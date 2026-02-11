from fastapi import HTTPException, Response, status, Depends, APIRouter
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from .. import models, schemas
from .. db_config import get_db
from .. import utils, oauth2

router = APIRouter(
    prefix="/auth",
    tags=['auth']
)

@router.post("/login")
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Wrong creds!")
    
    if not utils.verify_password(user_credentials.password, user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Wrong credentials!")
    
    access_token = oauth2.create_access_token(data={"uid": user.uid, "user_type": user.user_type})
    
    # Return user info along with token
    return {
        "login_access_token": access_token, 
        "token_type": "bearer",
        "user_info": {
            "uid": user.uid,
            "username": user.username,
            "email": user.email,
            "user_type": user.user_type,
            "status": user.status,
            "photo": user.photo
        }
    }
