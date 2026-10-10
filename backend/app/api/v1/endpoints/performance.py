"""Performance Records and Fit Evaluation Router."""

from datetime import datetime
from typing import Any, Dict, List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.core.deps import get_current_student, get_database
from app.schemas.analytics import PerformanceRecordCreate, PerformanceRecordResponse
from app.schemas.common import ApiResponse

router = APIRouter()


@router.post("", response_model=ApiResponse[PerformanceRecordResponse], status_code=status.HTTP_201_CREATED)
def record_performance_evaluation(
    payload: PerformanceRecordCreate,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Stores a placement readiness/skill-fit evaluation for a specific job."""
    profile = student_ctx["profile"]
    if not profile or not ObjectId.is_valid(payload.job_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid profile or job ID.")

    job_oid = ObjectId(payload.job_id)
    job = db["jobs"].find_one({"_id": job_oid})
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    company = db["companies"].find_one({"_id": job.get("company_id")})
    now = datetime.utcnow()

    doc = {
        "student_id": profile["_id"],
        "job_id": job_oid,
        "skill_match_score": payload.skill_match_score,
        "eligibility_status": payload.eligibility_status,
        "eligibility_reason": payload.eligibility_reason,
        "assessed_at": now,
    }
    res = db["performance_records"].insert_one(doc)
    doc["_id"] = res.inserted_id

    return ApiResponse(
        message="Performance evaluation recorded.",
        data=PerformanceRecordResponse(
            id=str(doc["_id"]),
            student_id=str(doc["student_id"]),
            job_id=str(doc["job_id"]),
            job_title=job.get("title"),
            company_name=company.get("name") if company else None,
            skill_match_score=doc["skill_match_score"],
            eligibility_status=doc["eligibility_status"],
            eligibility_reason=doc.get("eligibility_reason"),
            assessed_at=doc["assessed_at"],
        ),
    )


@router.get("/me", response_model=ApiResponse[List[PerformanceRecordResponse]])
def list_my_performance_records(
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Lists performance and readiness evaluation records for the current student."""
    profile = student_ctx["profile"]
    if not profile:
        return ApiResponse(data=[])

    records_cursor = db["performance_records"].find({"student_id": profile["_id"]}).sort("assessed_at", -1)
    results = []
    for r in records_cursor:
        job = db["jobs"].find_one({"_id": r.get("job_id")})
        company = db["companies"].find_one({"_id": job.get("company_id")}) if job else None
        results.append(
            PerformanceRecordResponse(
                id=str(r["_id"]),
                student_id=str(r["student_id"]),
                job_id=str(r["job_id"]),
                job_title=job.get("title") if job else None,
                company_name=company.get("name") if company else None,
                skill_match_score=r.get("skill_match_score", 0.0),
                eligibility_status=r.get("eligibility_status", "unknown"),
                eligibility_reason=r.get("eligibility_reason"),
                assessed_at=r.get("assessed_at", datetime.utcnow()),
            )
        )
    return ApiResponse(data=results)
