"""User Management Router."""

from datetime import datetime
from typing import Any, Dict, List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo.database import Database

from app.core.deps import get_current_admin, get_database
from app.schemas.auth import UserResponse
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
