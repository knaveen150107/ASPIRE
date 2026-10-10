"""Resumes and Tailored Versions Router."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.core.deps import get_current_student, get_database
from app.schemas.common import ApiResponse
from app.schemas.skill_gap import (
    ResumeCreate,
    ResumeResponse,
    ResumeVersionCreate,
    ResumeVersionResponse,
)

router = APIRouter()


@router.post("", response_model=ApiResponse[ResumeResponse], status_code=status.HTTP_201_CREATED)
def create_master_resume(
    payload: ResumeCreate,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Creates a master resume record for the student."""
    profile = student_ctx["profile"]
    if not profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile is incomplete.")

    now = datetime.utcnow()
    doc = {
        "student_id": profile["_id"],
        "title": payload.title,
        "file_url": payload.file_url,
        "file_type": payload.file_type,
        "created_at": now,
        "updated_at": now,
    }
    result = db["resumes"].insert_one(doc)
    doc["_id"] = result.inserted_id

    return ApiResponse(
        message="Master resume registered successfully.",
        data=ResumeResponse(
            id=str(doc["_id"]),
            student_id=str(doc["student_id"]),
            title=doc["title"],
            file_url=doc["file_url"],
            file_type=doc["file_type"],
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
        ),
    )


@router.get("/me", response_model=ApiResponse[List[ResumeResponse]])
def list_my_resumes(
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Lists all master resumes uploaded by the student."""
    profile = student_ctx["profile"]
    if not profile:
        return ApiResponse(data=[])

    resumes_cursor = db["resumes"].find({"student_id": profile["_id"]}).sort("created_at", -1)
    results = [
        ResumeResponse(
            id=str(r["_id"]),
            student_id=str(r["student_id"]),
            title=r["title"],
            file_url=r["file_url"],
            file_type=r.get("file_type", "pdf"),
            created_at=r.get("created_at", datetime.utcnow()),
            updated_at=r.get("updated_at", datetime.utcnow()),
        )
        for r in resumes_cursor
    ]
    return ApiResponse(data=results)


@router.post(
    "/{resume_id}/versions",
    response_model=ApiResponse[ResumeVersionResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_tailored_version(
    resume_id: str,
    payload: ResumeVersionCreate,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Generates and saves a tailored resume version for a target job."""
    profile = student_ctx["profile"]
    if not profile or not ObjectId.is_valid(resume_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid resume ID.")

    resume = db["resumes"].find_one({"_id": ObjectId(resume_id), "student_id": profile["_id"]})
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Master resume not found.")

    job_oid = ObjectId(payload.job_id) if payload.job_id and ObjectId.is_valid(payload.job_id) else None
    now = datetime.utcnow()

    # Calculate version number
    version_count = db["resume_versions"].count_documents({"resume_id": ObjectId(resume_id)})
    version_number = version_count + 1

    doc = {
        "resume_id": ObjectId(resume_id),
        "job_id": job_oid,
        "content": payload.content,
        "file_url": payload.file_url,
        "version_number": version_number,
        "created_at": now,
    }
    result = db["resume_versions"].insert_one(doc)
    doc["_id"] = result.inserted_id

    job = db["jobs"].find_one({"_id": job_oid}) if job_oid else None

    return ApiResponse(
        message="Tailored resume version created.",
        data=ResumeVersionResponse(
            id=str(doc["_id"]),
            resume_id=str(doc["resume_id"]),
            job_id=str(job_oid) if job_oid else None,
            job_title=job.get("title") if job else None,
            content=doc["content"],
            file_url=doc.get("file_url"),
            version_number=version_number,
            created_at=now,
        ),
    )


@router.get("/{resume_id}/versions", response_model=ApiResponse[List[ResumeVersionResponse]])
def list_resume_versions(
    resume_id: str,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Lists all tailored versions of a specific master resume."""
    if not ObjectId.is_valid(resume_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid resume ID.")

    versions_cursor = db["resume_versions"].find({"resume_id": ObjectId(resume_id)}).sort("version_number", -1)
    results = []
    for v in versions_cursor:
        job = db["jobs"].find_one({"_id": v.get("job_id")}) if v.get("job_id") else None
        results.append(
            ResumeVersionResponse(
                id=str(v["_id"]),
                resume_id=str(v["resume_id"]),
                job_id=str(v["job_id"]) if v.get("job_id") else None,
                job_title=job.get("title") if job else None,
                content=v.get("content", {}),
                file_url=v.get("file_url"),
                version_number=v.get("version_number", 1),
                created_at=v.get("created_at", datetime.utcnow()),
            )
        )
    return ApiResponse(data=results)
