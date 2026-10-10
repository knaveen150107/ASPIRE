"""User Management Router."""

from datetime import datetime
from typing import Any, Dict, List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo.database import Database

from app.core.deps import get_current_admin, get_database
from app.core.security import get_password_hash
from app.schemas.auth import CreateRecruiterRequest, UserResponse
from app.schemas.common import ApiResponse

router = APIRouter()


@router.get("", response_model=ApiResponse[List[UserResponse]])
def list_all_users(
    role: str = Query(None, description="Filter by role"),
    admin_user: Dict[str, Any] = Depends(get_current_admin),
    db: Database = Depends(get_database),
) -> Any:
    """Lists registered users (Admin only)."""
    query = {}
    if role:
        query["role"] = role

    cursor = db["users"].find(query).sort("created_at", -1)
    results = [
        UserResponse(
            id=str(u["_id"]),
            name=u["name"],
            email=u["email"],
            role=u["role"],
            is_active=u.get("is_active", True),
            created_at=u.get("created_at", datetime.now()),
            updated_at=u.get("updated_at", datetime.now()),
        )
        for u in cursor
    ]
    return ApiResponse(data=results)


@router.post("/recruiters", response_model=ApiResponse[UserResponse], status_code=status.HTTP_201_CREATED)
def create_recruiter_by_admin(
    payload: CreateRecruiterRequest,
    admin_user: Dict[str, Any] = Depends(get_current_admin),
    db: Database = Depends(get_database),
) -> Any:
    """Allows administrators to create and provision recruiter accounts directly."""
    existing = db["users"].find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    now = datetime.now()
    user_doc = {
        "name": payload.name,
        "email": payload.email.lower(),
        "password_hash": get_password_hash(payload.password),
        "role": "recruiter",
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }
    insert_result = db["users"].insert_one(user_doc)
    user_id = insert_result.inserted_id

    # Handle company linkage
    company_id = None
    if payload.company_name:
        comp = db["companies"].find_one({"name": payload.company_name})
        if comp:
            company_id = comp["_id"]
        else:
            comp_res = db["companies"].insert_one({
                "name": payload.company_name,
                "domain": "Technology",
                "website": f"https://{payload.company_name.lower().replace(' ', '')}.com",
                "verified": True,
                "created_at": now,
                "updated_at": now,
            })
            company_id = comp_res.inserted_id

    # Insert Recruiter Profile
    db["recruiter_profiles"].insert_one({
        "user_id": user_id,
        "company_id": company_id,
        "designation": payload.designation or "Recruiter",
        "organization_email": payload.email.lower(),
        "verified": True,
        "created_at": now,
        "updated_at": now,
    })

    # Log audit event
    admin_obj_id = ObjectId(admin_user["id"]) if ObjectId.is_valid(admin_user.get("id", "")) else None
    db["audit_logs"].insert_one({
        "user_id": admin_obj_id,
        "action": "ADMIN_CREATE_RECRUITER",
        "entity_type": "users",
        "entity_id": user_id,
        "metadata": {
            "recruiter_name": payload.name,
            "recruiter_email": payload.email,
            "company_name": payload.company_name,
        },
        "created_at": now,
    })

    return ApiResponse(
        message=f"Recruiter account for {payload.name} created successfully.",
        data=UserResponse(
            id=str(user_id),
            name=payload.name,
            email=payload.email.lower(),
            role="recruiter",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
    )


@router.put("/{user_id}/status", response_model=ApiResponse[bool])
def update_user_status(
    user_id: str,
    is_active: bool,
    admin_user: Dict[str, Any] = Depends(get_current_admin),
    db: Database = Depends(get_database),
) -> Any:
    """Activates or deactivates a user account (Admin only)."""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID.")

    res = db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": is_active, "updated_at": datetime.now()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    return ApiResponse(message=f"User account {'activated' if is_active else 'deactivated'}.", data=True)

