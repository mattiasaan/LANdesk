from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
import json
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="./secure/.env")
SECRET_KEY = os.getenv("KEY", "key")

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE = 120


USERS_PATH = "./secure/users.json"

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

router = APIRouter(prefix="/auth", tags=["auth"])



def load_users():
  if not os.path.exists(USERS_PATH):
    return {}
  with open(USERS_PATH, "r") as f:
    return json.load(f)

def get_user(username: str):
  users = load_users()
  return users.get(username)


def verify_password(plain_password, hashed_password):
  return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
  to_encode = data.copy()
  expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
  to_encode.update({"exp": expire})
  return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
  user = get_user(form_data.username)
  if not user or not verify_password(form_data.password, user["hashed_password"]):
    raise HTTPException(status_code=401, detail="invalid credentials")

  access_token = create_access_token(
    data={"sub": user["username"]},
    expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE)
  )
  return {"access_token": access_token, "token_type": "bearer"}


async def get_current_user(token: str = Depends(oauth2_scheme)):
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    username: str = payload.get("sub")

    if username is None:
      raise HTTPException(401, "invalid token")
  
  except JWTError:
    raise HTTPException(401, "invalid token")
  user = get_user(username)

  if not user:
    raise HTTPException(401, "user nit found")
  return user
