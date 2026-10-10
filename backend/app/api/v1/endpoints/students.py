"""Student Profile and Skills Router."""

from datetime import datetime
from typing import Any, Dict, List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.core.deps import get_current_student, get_database
from app.schemas.common import ApiResponse
from app.schemas.student import (
    StudentProfileResponse,
    StudentProfileUpdate,
    StudentSkillCreate,
    StudentSkillResponse,
)

router = APIRouter()


@router.get("/me/profile", response_model=ApiResponse[StudentProfileResponse])
def get_my_student_profile(
    student_ctx: Dict[str, Any] = Depends(get_current_student),
) -> Any:
    """Returns the authenticated student's academic profile."""
    user = student_ctx["user"]
    profile = student_ctx["profile"]
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found.")

    return ApiResponse(
        data=StudentProfileResponse(
            id=str(profile["_id"]),
            user_id=str(user["_id"]),
            name=user.get("name"),
            email=user.get("email"),
            register_number=profile.get("register_number", ""),
            department=profile.get("department", ""),
            degree=profile.get("degree", ""),
            graduation_year=profile.get("graduation_year", 2026),
            cgpa=profile.get("cgpa", 0.0),
            profile_summary=profile.get("profile_summary"),
            created_at=profile.get("created_at", datetime.now()),
            updated_at=profile.get("updated_at", datetime.now()),
        )
    )


@router.put("/me/profile", response_model=ApiResponse[StudentProfileResponse])
def update_my_student_profile(
    payload: StudentProfileUpdate,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Updates academic details and summary of the student profile."""
    profile = student_ctx["profile"]
    user = student_ctx["user"]
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found.")

    update_fields = payload.model_dump(exclude_unset=True)
    update_fields["updated_at"] = datetime.now()

    db["student_profiles"].update_one(
        {"_id": profile["_id"]},
        {"$set": update_fields},
    )

    updated_profile = db["student_profiles"].find_one({"_id": profile["_id"]})
    return ApiResponse(
        message="Profile updated successfully.",
        data=StudentProfileResponse(
            id=str(updated_profile["_id"]),
            user_id=str(user["_id"]),
            name=user.get("name"),
            email=user.get("email"),
            register_number=updated_profile.get("register_number", ""),
            department=updated_profile.get("department", ""),
            degree=updated_profile.get("degree", ""),
            graduation_year=updated_profile.get("graduation_year", 2026),
            cgpa=updated_profile.get("cgpa", 0.0),
            profile_summary=updated_profile.get("profile_summary"),
            created_at=updated_profile.get("created_at"),
            updated_at=updated_profile.get("updated_at"),
        ),
    )


@router.get("/me/skills", response_model=ApiResponse[List[StudentSkillResponse]])
def list_my_skills(
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Lists all skills associated with the authenticated student."""
    profile = student_ctx["profile"]
    if not profile:
        return ApiResponse(data=[])

    skills_cursor = db["student_skills"].find({"student_id": profile["_id"]})
    results = []
    for doc in skills_cursor:
        skill_doc = db["skills"].find_one({"_id": doc["skill_id"]})
        results.append(
            StudentSkillResponse(
                id=str(doc["_id"]),
                student_id=str(doc["student_id"]),
                skill_id=str(doc["skill_id"]),
                skill_name=skill_doc["name"] if skill_doc else None,
                category=skill_doc.get("category") if skill_doc else None,
                proficiency=doc.get("proficiency", "beginner"),
                evidence=doc.get("evidence"),
                updated_at=doc.get("updated_at", datetime.now()),
            )
        )
    return ApiResponse(data=results)


@router.post("/me/skills", response_model=ApiResponse[StudentSkillResponse], status_code=status.HTTP_201_CREATED)
def add_or_update_my_skill(
    payload: StudentSkillCreate,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Adds a new skill or updates proficiency of an existing skill for the student."""
    profile = student_ctx["profile"]
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found.")

    if not ObjectId.is_valid(payload.skill_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid skill ID format.")

    skill_oid = ObjectId(payload.skill_id)
    skill_doc = db["skills"].find_one({"_id": skill_oid})
    if not skill_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced skill does not exist.")

    now = datetime.now()
    # Upsert student skill
    result = db["student_skills"].find_one_and_update(
        {"student_id": profile["_id"], "skill_id": skill_oid},
        {
            "$set": {
                "proficiency": payload.proficiency,
                "evidence": payload.evidence,
                "updated_at": now,
            },
            "$setOnInsert": {
                "_id": ObjectId(),
                "student_id": profile["_id"],
                "skill_id": skill_oid,
            },
        },
        upsert=True,
        return_document=True,
    )

    return ApiResponse(
        message="Skill saved successfully.",
        data=StudentSkillResponse(
            id=str(result["_id"]),
            student_id=str(profile["_id"]),
            skill_id=str(skill_oid),
            skill_name=skill_doc.get("name"),
            category=skill_doc.get("category"),
            proficiency=result.get("proficiency", payload.proficiency),
            evidence=result.get("evidence"),
            updated_at=result.get("updated_at", now),
        ),
    )


@router.delete("/me/skills/{skill_id}", response_model=ApiResponse[bool])
def delete_my_skill(
    skill_id: str,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Removes a skill from the student's profile."""
    profile = student_ctx["profile"]
    if not profile or not ObjectId.is_valid(skill_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid profile or skill ID.")

    res = db["student_skills"].delete_one({"student_id": profile["_id"], "skill_id": ObjectId(skill_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found on student profile.")

    return ApiResponse(message="Skill removed successfully.", data=True)


@router.get("/me/dashboard", response_model=ApiResponse[Dict[str, Any]])
def get_student_dashboard_overview(
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Provides an aggregated placement dashboard summary for the student."""
    profile = student_ctx["profile"]
    student_id = profile["_id"] if profile else None

    if not student_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found.")

    applications_count = db["applications"].count_documents({"student_id": student_id})
    tests_count = db["mock_tests"].count_documents({"student_id": student_id})
    reports_count = db["skill_gap_reports"].count_documents({"student_id": student_id})
    roadmaps_count = db["roadmaps"].count_documents({"student_id": student_id})
    unread_notifications = db["notifications"].count_documents({"student_id": student_id, "is_read": False})

    # Latest test result
    latest_result = db["test_results"].find_one({"student_id": student_id}, sort=[("evaluated_at", -1)])

    return ApiResponse(
        data={
            "profile_completed": bool(profile.get("cgpa", 0) > 0),
            "cgpa": profile.get("cgpa", 0.0),
            "department": profile.get("department", "Unassigned"),
            "total_applications": applications_count,
            "total_mock_tests": tests_count,
            "total_gap_reports": reports_count,
            "active_roadmaps": roadmaps_count,
            "unread_notifications": unread_notifications,
            "latest_test_percentage": latest_result.get("percentage") if latest_result else None,
        }
    )
