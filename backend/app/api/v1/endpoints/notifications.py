"""Student Notifications Router."""

from datetime import datetime
from typing import Any, Dict, List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.core.deps import get_current_student, get_database
from app.schemas.analytics import NotificationResponse
from app.schemas.common import ApiResponse

router = APIRouter()


@router.get("/me", response_model=ApiResponse[List[NotificationResponse]])
def list_my_notifications(
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Lists notifications for the current student."""
    profile = student_ctx["profile"]
    if not profile:
        return ApiResponse(data=[])

    cursor = db["notifications"].find({"student_id": profile["_id"]}).sort("created_at", -1).limit(50)
    results = [
        NotificationResponse(
            id=str(n["_id"]),
            student_id=str(n["student_id"]),
            title=n["title"],
            message=n["message"],
            is_read=n.get("is_read", False),
            created_at=n.get("created_at", datetime.now()),
        )
        for n in cursor
    ]
    return ApiResponse(data=results)


@router.put("/{notification_id}/read", response_model=ApiResponse[bool])
def mark_notification_as_read(
    notification_id: str,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Marks an unread notification as read."""
    profile = student_ctx["profile"]
    if not profile or not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid notification ID.")

    res = db["notifications"].update_one(
        {"_id": ObjectId(notification_id), "student_id": profile["_id"]},
        {"$set": {"is_read": True}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    return ApiResponse(message="Notification marked as read.", data=True)
