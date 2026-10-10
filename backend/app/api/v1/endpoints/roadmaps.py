"""Learning Roadmaps and Sequenced Steps Router."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.core.deps import get_current_student, get_database
from app.schemas.common import ApiResponse
from app.schemas.skill_gap import (
    RoadmapCreate,
    RoadmapResponse,
    RoadmapStepResponse,
    RoadmapStepUpdate,
)

router = APIRouter()


@router.post("", response_model=ApiResponse[RoadmapResponse], status_code=status.HTTP_201_CREATED)
def create_roadmap(
    payload: RoadmapCreate,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Creates a new learning roadmap with ordered steps."""
    profile = student_ctx["profile"]
    if not profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile is incomplete.")

    report_oid = ObjectId(payload.report_id) if payload.report_id and ObjectId.is_valid(payload.report_id) else None
    now = datetime.now()

    roadmap_doc = {
        "student_id": profile["_id"],
        "report_id": report_oid,
        "title": payload.title,
        "target_date": payload.target_date,
        "status": "not_started",
        "created_at": now,
        "updated_at": now,
    }
    res = db["roadmaps"].insert_one(roadmap_doc)
    roadmap_id = res.inserted_id

    step_responses = []
    if payload.steps:
        for s in payload.steps:
            if not ObjectId.is_valid(s.skill_id):
                continue
            skill_oid = ObjectId(s.skill_id)
            skill = db["skills"].find_one({"_id": skill_oid})
            step_doc = {
                "roadmap_id": roadmap_id,
                "skill_id": skill_oid,
                "title": s.title,
                "description": s.description,
                "resource_url": s.resource_url,
                "sequence_number": s.sequence_number,
                "status": "pending",
                "created_at": now,
                "updated_at": now,
            }
            s_res = db["roadmap_steps"].insert_one(step_doc)
            step_responses.append(
                RoadmapStepResponse(
                    id=str(s_res.inserted_id),
                    roadmap_id=str(roadmap_id),
                    skill_id=str(skill_oid),
                    skill_name=skill.get("name") if skill else None,
                    title=s.title,
                    description=s.description,
                    resource_url=s.resource_url,
                    sequence_number=s.sequence_number,
                    status="pending",
                    created_at=now,
                    updated_at=now,
                )
            )

    return ApiResponse(
        message="Roadmap created successfully.",
        data=RoadmapResponse(
            id=str(roadmap_id),
            student_id=str(profile["_id"]),
            report_id=str(report_oid) if report_oid else None,
            title=payload.title,
            target_date=payload.target_date,
            status="not_started",
            steps=step_responses,
            created_at=now,
            updated_at=now,
        ),
    )


@router.get("/me", response_model=ApiResponse[List[RoadmapResponse]])
def list_my_roadmaps(
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Lists learning roadmaps for the current student."""
    profile = student_ctx["profile"]
    if not profile:
        return ApiResponse(data=[])

    roadmaps_cursor = db["roadmaps"].find({"student_id": profile["_id"]}).sort("created_at", -1)
    results = []
    for r in roadmaps_cursor:
        steps_cursor = db["roadmap_steps"].find({"roadmap_id": r["_id"]}).sort("sequence_number", 1)
        steps = []
        for st in steps_cursor:
            skill = db["skills"].find_one({"_id": st.get("skill_id")})
            steps.append(
                RoadmapStepResponse(
                    id=str(st["_id"]),
                    roadmap_id=str(st["roadmap_id"]),
                    skill_id=str(st["skill_id"]),
                    skill_name=skill.get("name") if skill else None,
                    title=st["title"],
                    description=st["description"],
                    resource_url=st.get("resource_url"),
                    sequence_number=st["sequence_number"],
                    status=st.get("status", "pending"),
                    created_at=st.get("created_at", datetime.now()),
                    updated_at=st.get("updated_at", datetime.now()),
                )
            )

        results.append(
            RoadmapResponse(
                id=str(r["_id"]),
                student_id=str(r["student_id"]),
                report_id=str(r["report_id"]) if r.get("report_id") else None,
                title=r["title"],
                target_date=r.get("target_date"),
                status=r.get("status", "not_started"),
                steps=steps,
                created_at=r.get("created_at", datetime.now()),
                updated_at=r.get("updated_at", datetime.now()),
            )
        )
    return ApiResponse(data=results)


@router.put("/steps/{step_id}", response_model=ApiResponse[RoadmapStepResponse])
def update_roadmap_step(
    step_id: str,
    payload: RoadmapStepUpdate,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Updates progress status or details for an individual roadmap step."""
    if not ObjectId.is_valid(step_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid step ID.")

    step = db["roadmap_steps"].find_one({"_id": ObjectId(step_id)})
    if not step:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap step not found.")

    update_fields = payload.model_dump(exclude_unset=True)
    update_fields["updated_at"] = datetime.now()

    db["roadmap_steps"].update_one({"_id": ObjectId(step_id)}, {"$set": update_fields})
    updated = db["roadmap_steps"].find_one({"_id": ObjectId(step_id)})
    skill = db["skills"].find_one({"_id": updated.get("skill_id")})

    return ApiResponse(
        message="Step updated.",
        data=RoadmapStepResponse(
            id=str(updated["_id"]),
            roadmap_id=str(updated["roadmap_id"]),
            skill_id=str(updated["skill_id"]),
            skill_name=skill.get("name") if skill else None,
            title=updated["title"],
            description=updated["description"],
            resource_url=updated.get("resource_url"),
            sequence_number=updated["sequence_number"],
            status=updated.get("status", "pending"),
            created_at=updated["created_at"],
            updated_at=updated["updated_at"],
        ),
    )
