from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User
from auth import decode_token

security = HTTPBearer()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    cred: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = cred.credentials

    payload = decode_token(token)

    user_id = payload.get("user_id")   # must match create_access_token

    if not user_id:
        raise HTTPException(401, "Invalid token payload")

    user = db.get(User, int(user_id))

    if not user:
        raise HTTPException(401, "User not found")

    return user


def doctor_only(user=Depends(get_current_user)):
    if user.role != "doctor":
        raise HTTPException(403, "Doctor access required")
    return user
