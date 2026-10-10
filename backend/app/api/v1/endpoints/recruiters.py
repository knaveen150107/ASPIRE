"""Recruiter Profile Router."""

from datetime import datetime
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.core.deps import get_current_recruiter, get_database
from app.schemas.common import ApiResponse
from app.schemas.student import RecruiterProfileResponse, RecruiterProfileUpdate

router = APIRouter()


@router.get("/me/profile", response_model=ApiResponse[RecruiterProfileResponse])
def get_my_recruiter_profile(
    recruiter_ctx: Dict[str, Any] = Depends(get_current_recruiter),
) -> Any:
    """Returns the authenticated recruiter's profile."""
    user = recruiter_ctx["user"]
    profile = recruiter_ctx["profile"]
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruiter profile not found.")

    return ApiResponse(
        data=RecruiterProfileResponse(
            id=str(profile["_id"]),
            user_id=str(user["_id"]),
            name=user.get("name"),
            email=user.get("email"),
            designation=profile.get("designation", ""),
            organization_email=profile.get("organization_email", ""),
            verified=profile.get("verified", False),
            created_at=profile.get("created_at", datetime.utcnow()),
            updated_at=profile.get("updated_at", datetime.utcnow()),
        )
    )


@router.put("/me/profile", response_model=ApiResponse[RecruiterProfileResponse])
def update_my_recruiter_profile(
    payload: RecruiterProfileUpdate,
    recruiter_ctx: Dict[str, Any] = Depends(get_current_recruiter),
    db: Database = Depends(get_database),
) -> Any:
    """Updates recruiter designation and contact email."""
    profile = recruiter_ctx["profile"]
    user = recruiter_ctx["user"]
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruiter profile not found.")

    update_fields = payload.model_dump(exclude_unset=True)
    update_fields["updated_at"] = datetime.utcnow()

    db["recruiter_profiles"].update_one(
        {"_id": profile["_id"]},
        {"$set": update_fields},
    )

    updated_profile = db["recruiter_profiles"].find_one({"_id": profile["_id"]})
    return ApiResponse(
        message="Profile updated successfully.",
        data=RecruiterProfileResponse(
            id=str(updated_profile["_id"]),
            user_id=str(user["_id"]),
            name=user.get("name"),
            email=user.get("email"),
            designation=updated_profile.get("designation", ""),
            organization_email=updated_profile.get("organization_email", ""),
            verified=updated_profile.get("verified", False),
            created_at=updated_profile.get("created_at"),
            updated_at=updated_profile.get("updated_at"),
        ),
    )
