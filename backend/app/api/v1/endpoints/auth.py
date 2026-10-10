"""Authentication Router."""

from datetime import datetime
from typing import Any, Dict
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pymongo.database import Database

from app.core.deps import get_current_user, get_database
from app.core.security import create_access_token, get_password_hash, verify_password
from app.schemas.auth import TokenResponse, UserLogin, UserRegister, UserResponse
from app.schemas.common import ApiResponse

router = APIRouter()


@router.post("/register", response_model=ApiResponse[TokenResponse], status_code=status.HTTP_201_CREATED)
def register_user(
    payload: UserRegister,
    db: Database = Depends(get_database),
) -> Any:
    """Registers a new user account (Student, Recruiter, or Admin)."""
    # Check if user email already exists
    existing = db["users"].find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    now = datetime.now()
    user_doc = {
        "name": payload.name,
        "email": payload.email.lower(),
        "password_hash": get_password_hash(payload.password),
        "role": payload.role,
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }

    insert_result = db["users"].insert_one(user_doc)
    user_id = insert_result.inserted_id

    # Create corresponding initial profile shell
    if payload.role == "student":
        db["student_profiles"].insert_one({
            "user_id": user_id,
            "register_number": f"REG-{user_id}",
            "department": "Unassigned",
            "degree": "B.Tech",
            "graduation_year": now.year,
            "cgpa": 0.0,
            "profile_summary": "",
            "created_at": now,
            "updated_at": now,
        })
    elif payload.role == "recruiter":
        db["recruiter_profiles"].insert_one({
            "user_id": user_id,
            "designation": "Recruiter",
            "organization_email": payload.email.lower(),
            "verified": False,
            "created_at": now,
            "updated_at": now,
        })
    elif payload.role == "admin":
        db["admin_profiles"].insert_one({
            "user_id": user_id,
            "permissions": ["all"],
            "created_at": now,
            "updated_at": now,
        })

    # Log audit event
    db["audit_logs"].insert_one({
        "user_id": user_id,
        "action": "USER_REGISTER",
        "entity_type": "users",
        "entity_id": user_id,
        "metadata": {"role": payload.role},
        "created_at": now,
    })

    token = create_access_token(subject=user_id, role=payload.role)
    return ApiResponse(
        message="Registration successful.",
        data=TokenResponse(
            access_token=token,
            user_id=str(user_id),
            name=payload.name,
            email=payload.email.lower(),
            role=payload.role,
        ),
    )


@router.post("/login", response_model=ApiResponse[TokenResponse])
def login_user(
    payload: UserLogin,
    db: Database = Depends(get_database),
) -> Any:
    """Authenticates user with email and password, returning a JWT token."""
    user = db["users"].find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.get("is_active", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated.")

    # Audit log
    db["audit_logs"].insert_one({
        "user_id": user["_id"],
        "action": "USER_LOGIN",
        "entity_type": "users",
        "entity_id": user["_id"],
        "metadata": {},
        "created_at": datetime.now(),
    })

    token = create_access_token(subject=user["_id"], role=user.get("role", "student"))
    return ApiResponse(
        message="Login successful.",
        data=TokenResponse(
            access_token=token,
            user_id=str(user["_id"]),
            name=user.get("name", ""),
            email=user.get("email", ""),
            role=user.get("role", "student"),
        ),
    )


@router.post("/token", response_model=TokenResponse)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Database = Depends(get_database),
) -> Any:
    """OAuth2 compatible token endpoint for Swagger UI documentation."""
    user = db["users"].find_one({"email": form_data.username.lower()})
    if not user or not verify_password(form_data.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(subject=user["_id"], role=user.get("role", "student"))
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=str(user["_id"]),
        name=user.get("name", ""),
        email=user.get("email", ""),
        role=user.get("role", "student"),
    )


@router.get("/me", response_model=ApiResponse[UserResponse])
def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Any:
    """Returns profile details of the authenticated user."""
    return ApiResponse(
        data=UserResponse(
            id=str(current_user["_id"]),
            name=current_user.get("name", ""),
            email=current_user.get("email", ""),
            role=current_user.get("role", "student"),
            is_active=current_user.get("is_active", True),
            created_at=current_user.get("created_at") or datetime.now(),
            updated_at=current_user.get("updated_at") or datetime.now(),
        )
    )
