"""Skill-Gap Reports and Analysis Router."""

from datetime import datetime
from typing import Any, Dict, List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.core.deps import get_current_student, get_database
from app.schemas.common import ApiResponse
from app.schemas.skill_gap import (
    SkillGapItemResponse,
    SkillGapReportCreate,
    SkillGapReportResponse,
)

router = APIRouter()


@router.post("", response_model=ApiResponse[SkillGapReportResponse], status_code=status.HTTP_201_CREATED)
def create_skill_gap_report(
    payload: SkillGapReportCreate,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Creates a new skill-gap analysis report comparing student capabilities with job requirements."""
    profile = student_ctx["profile"]
    if not profile or not ObjectId.is_valid(payload.job_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid profile or job ID.")

    job_oid = ObjectId(payload.job_id)
    job = db["jobs"].find_one({"_id": job_oid})
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    now = datetime.now()
    report_doc = {
        "student_id": profile["_id"],
        "job_id": job_oid,
        "readiness_score": payload.readiness_score,
        "summary": payload.summary,
        "generated_at": now,
    }
    result = db["skill_gap_reports"].insert_one(report_doc)
    report_id = result.inserted_id

    gaps_responses = []
    if payload.gaps:
        for g in payload.gaps:
            if not ObjectId.is_valid(g.skill_id):
                continue
            skill_oid = ObjectId(g.skill_id)
            skill = db["skills"].find_one({"_id": skill_oid})
            gap_doc = {
                "report_id": report_id,
                "skill_id": skill_oid,
                "current_level": g.current_level,
                "target_level": g.target_level,
                "priority": g.priority,
                "created_at": now,
            }
            g_res = db["skill_gaps"].insert_one(gap_doc)
            gaps_responses.append(
                SkillGapItemResponse(
                    id=str(g_res.inserted_id),
                    report_id=str(report_id),
                    skill_id=str(skill_oid),
                    skill_name=skill.get("name") if skill else None,
                    current_level=g.current_level,
                    target_level=g.target_level,
                    priority=g.priority,
                    created_at=now,
                )
            )

    return ApiResponse(
        message="Skill-gap report generated.",
        data=SkillGapReportResponse(
            id=str(report_id),
            student_id=str(profile["_id"]),
            job_id=str(job_oid),
            job_title=job.get("title"),
            readiness_score=payload.readiness_score,
            summary=payload.summary,
            gaps=gaps_responses,
            generated_at=now,
        ),
    )


@router.get("/me", response_model=ApiResponse[List[SkillGapReportResponse]])
def list_my_skill_gap_reports(
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Lists all skill-gap reports for the current student."""
    profile = student_ctx["profile"]
    if not profile:
        return ApiResponse(data=[])

    reports_cursor = db["skill_gap_reports"].find({"student_id": profile["_id"]}).sort("generated_at", -1)
    results = []
    for r in reports_cursor:
        job = db["jobs"].find_one({"_id": r.get("job_id")})
        gaps_cursor = db["skill_gaps"].find({"report_id": r["_id"]})
        gap_items = []
        for g in gaps_cursor:
            skill = db["skills"].find_one({"_id": g.get("skill_id")})
            gap_items.append(
                SkillGapItemResponse(
                    id=str(g["_id"]),
                    report_id=str(g["report_id"]),
                    skill_id=str(g["skill_id"]),
                    skill_name=skill.get("name") if skill else None,
                    current_level=g.get("current_level", "none"),
                    target_level=g.get("target_level", "intermediate"),
                    priority=g.get("priority", "high"),
                    created_at=g.get("created_at", datetime.now()),
                )
            )

        results.append(
            SkillGapReportResponse(
                id=str(r["_id"]),
                student_id=str(r["student_id"]),
                job_id=str(r["job_id"]),
                job_title=job.get("title") if job else None,
                readiness_score=r.get("readiness_score", 0.0),
                summary=r.get("summary", ""),
                gaps=gap_items,
                generated_at=r.get("generated_at", datetime.now()),
            )
        )
    return ApiResponse(data=results)
