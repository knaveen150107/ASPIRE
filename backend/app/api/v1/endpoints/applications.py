"""Job Applications Router."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo.database import Database

from app.core.deps import get_current_recruiter, get_current_student, get_current_user, get_database
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationStatusUpdate
from app.schemas.common import ApiResponse

router = APIRouter()


@router.post("", response_model=ApiResponse[ApplicationResponse], status_code=status.HTTP_201_CREATED)
def submit_application(
    payload: ApplicationCreate,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Submits a student application for a target job opening with duplicate prevention."""
    profile = student_ctx["profile"]
    user = student_ctx["user"]
    if not profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile is incomplete.")

    if not ObjectId.is_valid(payload.job_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid job ID.")

    job_oid = ObjectId(payload.job_id)
    job = db["jobs"].find_one({"_id": job_oid})
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job posting does not exist.")

    # Prevent duplicate applications
    existing = db["applications"].find_one({"student_id": profile["_id"], "job_id": job_oid})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted an application for this job posting.",
        )

    resume_oid = ObjectId(payload.resume_id) if payload.resume_id and ObjectId.is_valid(payload.resume_id) else None

    now = datetime.now()
    doc = {
        "student_id": profile["_id"],
        "job_id": job_oid,
        "resume_id": resume_oid,
        "applied_at": now,
        "status": "applied",
        "source": payload.source,
        "notes": payload.notes,
        "created_at": now,
        "updated_at": now,
    }

    result = db["applications"].insert_one(doc)
    doc["_id"] = result.inserted_id

    # Create student notification
    db["notifications"].insert_one({
        "student_id": profile["_id"],
        "title": "Application Submitted",
        "message": f"Your application for '{job.get('title')}' has been submitted successfully.",
        "is_read": False,
        "created_at": now,
    })

    # Log audit event
    db["audit_logs"].insert_one({
        "user_id": user["_id"],
        "action": "JOB_APPLY",
        "entity_type": "applications",
        "entity_id": doc["_id"],
        "metadata": {"job_id": str(job_oid)},
        "created_at": now,
    })

    return ApiResponse(
        message="Application submitted successfully.",
        data=ApplicationResponse(
            id=str(doc["_id"]),
            student_id=str(doc["student_id"]),
            student_name=user.get("name"),
            job_id=str(doc["job_id"]),
            job_title=job.get("title"),
            resume_id=str(doc["resume_id"]) if doc.get("resume_id") else None,
            applied_at=doc["applied_at"],
            status=doc["status"],
            source=doc["source"],
            notes=doc.get("notes"),
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
        ),
    )


@router.get("/me", response_model=ApiResponse[List[ApplicationResponse]])
def list_my_applications(
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Lists all job applications submitted by the current student."""
    profile = student_ctx["profile"]
    if not profile:
        return ApiResponse(data=[])

    apps_cursor = db["applications"].find({"student_id": profile["_id"]}).sort("applied_at", -1)
    results = []
    for app in apps_cursor:
        job = db["jobs"].find_one({"_id": app.get("job_id")})
        company = db["companies"].find_one({"_id": job.get("company_id")}) if job and job.get("company_id") else None
        
        comp_name = (company.get("name") if company else None) or (job.get("company_name") if job else None)
        comp_logo = (company.get("logo_url") if company else None) or (job.get("company_logo") if job else None)
        salary_str = (job.get("package_details") if job and isinstance(job.get("package_details"), str) else None) or (job.get("salary_range") if job else None)
        job_type_str = (job.get("employment_type") if job else None) or (job.get("job_type") if job else None)
        min_cgpa_val = (job.get("min_cgpa") if job else None) or (job.get("eligibility_criteria", {}).get("min_cgpa") if job else None)

        results.append(
            ApplicationResponse(
                id=str(app["_id"]),
                student_id=str(app["student_id"]),
                student_name=student_ctx["user"].get("name"),
                job_id=str(app["job_id"]),
                job_title=job.get("title") if job else None,
                company_name=comp_name,
                company_logo=comp_logo,
                job_location=job.get("location") if job else None,
                salary_range=salary_str,
                job_type=job_type_str,
                min_cgpa=min_cgpa_val,
                resume_id=str(app["resume_id"]) if app.get("resume_id") else None,
                applied_at=app.get("applied_at", datetime.now()),
                status=app.get("status", "applied"),
                source=app.get("source", "portal"),
                notes=app.get("notes"),
                created_at=app.get("created_at", datetime.now()),
                updated_at=app.get("updated_at", datetime.now()),
            )
        )
    return ApiResponse(data=results)


@router.get("/job/{job_id}", response_model=ApiResponse[List[ApplicationResponse]])
def list_job_applications_for_recruiter(
    job_id: str,
    recruiter_ctx: Dict[str, Any] = Depends(get_current_recruiter),
    db: Database = Depends(get_database),
) -> Any:
    """Lists candidate applications received for a specific job (recruiter only)."""
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid job ID.")

    job = db["jobs"].find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    apps_cursor = db["applications"].find({"job_id": ObjectId(job_id)}).sort("applied_at", -1)
    results = []
    for app in apps_cursor:
        student_prof = db["student_profiles"].find_one({"_id": app.get("student_id")})
        student_user = (
            db["users"].find_one({"_id": student_prof.get("user_id")})
            if student_prof and student_prof.get("user_id")
            else None
        )
        results.append(
            ApplicationResponse(
                id=str(app["_id"]),
                student_id=str(app["student_id"]),
                student_name=student_user.get("name") if student_user else None,
                job_id=str(app["job_id"]),
                job_title=job.get("title"),
                resume_id=str(app["resume_id"]) if app.get("resume_id") else None,
                applied_at=app.get("applied_at", datetime.now()),
                status=app.get("status", "applied"),
                source=app.get("source", "portal"),
                notes=app.get("notes"),
                created_at=app.get("created_at", datetime.now()),
                updated_at=app.get("updated_at", datetime.now()),
            )
        )
    return ApiResponse(data=results)


@router.put("/{application_id}/status", response_model=ApiResponse[ApplicationResponse])
def update_application_status(
    application_id: str,
    payload: ApplicationStatusUpdate,
    recruiter_ctx: Dict[str, Any] = Depends(get_current_recruiter),
    db: Database = Depends(get_database),
) -> Any:
    """Updates candidate application status (e.g. shortlisted, offered, rejected)."""
    if not ObjectId.is_valid(application_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid application ID.")

    now = datetime.now()
    db["applications"].update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": payload.status, "notes": payload.notes, "updated_at": now}},
    )

    app = db["applications"].find_one({"_id": ObjectId(application_id)})
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    # Notify student
    db["notifications"].insert_one({
        "student_id": app["student_id"],
        "title": "Application Status Updated",
        "message": f"Your application status has been updated to '{payload.status}'.",
        "is_read": False,
        "created_at": now,
    })

    return ApiResponse(
        message="Application status updated.",
        data=ApplicationResponse(
            id=str(app["_id"]),
            student_id=str(app["student_id"]),
            job_id=str(app["job_id"]),
            applied_at=app["applied_at"],
            status=app["status"],
            source=app["source"],
            notes=app.get("notes"),
            created_at=app["created_at"],
            updated_at=app["updated_at"],
        ),
    )
