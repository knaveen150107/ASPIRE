"""FastAPI Dependencies for database access and authentication."""

from typing import Any, Dict
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pymongo.database import Database

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.connection import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def get_database() -> Database:
    """Dependency provider for active MongoDB database instance."""
    return get_db()


def get_current_user(
    db: Database = Depends(get_database),
    token: str = Depends(oauth2_scheme),
) -> Dict[str, Any]:
    """Decodes JWT and retrieves the currently authenticated user document."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id_str: str = payload.get("sub")
    if user_id_str is None or not ObjectId.is_valid(user_id_str):
        raise credentials_exception

    user = db["users"].find_one({"_id": ObjectId(user_id_str)})
    if user is None:
        raise credentials_exception
    if not user.get("is_active", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account.")

    return user


def get_current_student(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
) -> Dict[str, Any]:
    """Verifies student role and returns user document along with their student profile."""
    if current_user.get("role") != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to student accounts only.",
        )
    profile = db["student_profiles"].find_one({"user_id": current_user["_id"]})
    if not profile:
        from datetime import datetime
        now = datetime.now()
        new_profile = {
            "user_id": current_user["_id"],
            "register_number": "",
            "department": "Computer Science",
            "degree": "B.Tech",
            "graduation_year": 2026,
            "cgpa": 8.0,
            "active_backlogs": 0,
            "profile_summary": "Aspiring engineer",
            "created_at": now,
            "updated_at": now,
        }
        res = db["student_profiles"].insert_one(new_profile)
        new_profile["_id"] = res.inserted_id
        profile = new_profile

    return {"user": current_user, "profile": profile}


def get_current_recruiter(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
) -> Dict[str, Any]:
    """Verifies recruiter role and returns user document along with recruiter profile."""
    if current_user.get("role") != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to recruiter accounts only.",
        )
    profile = db["recruiter_profiles"].find_one({"user_id": current_user["_id"]})
    return {"user": current_user, "profile": profile}


def get_current_admin(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Verifies administrator privileges."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to administrators only.",
        )
    return current_user
