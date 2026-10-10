"""Job Postings and Eligibility Evaluation Router."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo.database import Database

from app.core.deps import get_current_recruiter, get_current_student, get_current_user, get_database
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.job import (
    EligibilityCheckResponse,
    JobCreate,
    JobRequirementCreate,
    JobRequirementResponse,
    JobResponse,
    JobUpdate,
)

router = APIRouter()


@router.get("", response_model=PaginatedResponse[JobResponse])
def list_jobs(
    department: Optional[str] = Query(None, description="Filter by eligible department"),
    degree: Optional[str] = Query(None, description="Filter by eligible degree"),
    graduation_year: Optional[int] = Query(None, description="Filter by graduation year"),
    employment_type: Optional[str] = Query(None, description="Filter by employment type"),
    status_filter: str = Query("published", description="Filter by status (default: published)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Database = Depends(get_database),
) -> Any:
    """Lists and filters job opportunities based on explicit eligibility parameters."""
    query: Dict[str, Any] = {"status": status_filter}
    if department:
        query["eligible_departments"] = department
    if degree:
        query["eligible_degrees"] = degree
    if graduation_year:
        query["graduation_years"] = graduation_year
    if employment_type:
        query["employment_type"] = employment_type

    skip = (page - 1) * page_size
    total = db["jobs"].count_documents(query)
    jobs_cursor = db["jobs"].find(query).sort("created_at", -1).skip(skip).limit(page_size)

    results = []
    for j in jobs_cursor:
        company = db["companies"].find_one({"_id": j.get("company_id")})
        results.append(
            JobResponse(
                id=str(j["_id"]),
                company_id=str(j["company_id"]),
                company_name=company.get("name") if company else None,
                title=j["title"],
                description=j["description"],
                location=j["location"],
                employment_type=j["employment_type"],
                min_cgpa=j.get("min_cgpa"),
                eligible_departments=j.get("eligible_departments", []),
                eligible_degrees=j.get("eligible_degrees", []),
                graduation_years=j.get("graduation_years", []),
                required_skills=[str(s) for s in j.get("required_skills", [])],
                preferred_skills=[str(s) for s in j.get("preferred_skills", [])],
                package_details=j.get("package_details"),
                application_url=j.get("application_url"),
                deadline=j.get("deadline"),
                status=j.get("status", "published"),
                source_name=j.get("source_name", "Campus Placement"),
                source_url=j.get("source_url"),
                created_at=j.get("created_at", datetime.now()),
                updated_at=j.get("updated_at", datetime.now()),
            )
        )
    return PaginatedResponse(total=total, page=page, page_size=page_size, data=results)


@router.get("/{job_id}", response_model=ApiResponse[JobResponse])
def get_job_details(
    job_id: str,
    db: Database = Depends(get_database),
) -> Any:
    """Retrieves full specifications for a single job posting."""
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid job ID.")

    job = db["jobs"].find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job posting not found.")

    company = db["companies"].find_one({"_id": job.get("company_id")})
    return ApiResponse(
        data=JobResponse(
            id=str(job["_id"]),
            company_id=str(job["company_id"]),
            company_name=company.get("name") if company else None,
            title=job["title"],
            description=job["description"],
            location=job["location"],
            employment_type=job["employment_type"],
            min_cgpa=job.get("min_cgpa"),
            eligible_departments=job.get("eligible_departments", []),
            eligible_degrees=job.get("eligible_degrees", []),
            graduation_years=job.get("graduation_years", []),
            required_skills=[str(s) for s in job.get("required_skills", [])],
            preferred_skills=[str(s) for s in job.get("preferred_skills", [])],
            package_details=job.get("package_details"),
            application_url=job.get("application_url"),
            deadline=job.get("deadline"),
            status=job.get("status", "published"),
            source_name=job.get("source_name", "Campus Placement"),
            source_url=job.get("source_url"),
            created_at=job.get("created_at", datetime.now()),
            updated_at=job.get("updated_at", datetime.now()),
        )
    )


@router.get("/{job_id}/eligibility", response_model=ApiResponse[EligibilityCheckResponse])
def check_job_eligibility(
    job_id: str,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Evaluates strict academic eligibility of the authenticated student against the job criteria."""
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid job ID.")

    job = db["jobs"].find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    profile = student_ctx["profile"]
    if not profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile is incomplete.")

    reasons: List[str] = []
    missing_criteria: List[str] = []
    academic_checks: Dict[str, Any] = {}
    is_eligible = True

    # 1. CGPA check
    student_cgpa = profile.get("cgpa", 0.0)
    min_cgpa = job.get("min_cgpa")
    if min_cgpa is not None:
        passed = student_cgpa >= min_cgpa
        academic_checks["cgpa"] = {"required": min_cgpa, "student": student_cgpa, "passed": passed}
        if not passed:
            is_eligible = False
            reasons.append(f"CGPA {student_cgpa} is below minimum requirement of {min_cgpa}")
    else:
        academic_checks["cgpa"] = {"required": None, "student": student_cgpa, "passed": True}

    # 2. Department check
    eligible_depts = job.get("eligible_departments", [])
    student_dept = profile.get("department", "")
    if eligible_depts:
        passed = any(d.lower() == student_dept.lower() for d in eligible_depts)
        academic_checks["department"] = {"eligible": eligible_depts, "student": student_dept, "passed": passed}
        if not passed:
            is_eligible = False
            reasons.append(f"Department '{student_dept}' is not in the eligible departments list.")
    else:
        academic_checks["department"] = {"eligible": [], "student": student_dept, "passed": True}

    # 3. Degree check
    eligible_degrees = job.get("eligible_degrees", [])
    student_degree = profile.get("degree", "")
    if eligible_degrees:
        passed = any(deg.lower() == student_degree.lower() for deg in eligible_degrees)
        academic_checks["degree"] = {"eligible": eligible_degrees, "student": student_degree, "passed": passed}
        if not passed:
            is_eligible = False
            reasons.append(f"Degree '{student_degree}' is not in the eligible degrees list.")
    else:
        academic_checks["degree"] = {"eligible": [], "student": student_degree, "passed": True}

    # 4. Graduation Year check
    eligible_years = job.get("graduation_years", [])
    student_year = profile.get("graduation_year")
    if eligible_years and student_year:
        passed = student_year in eligible_years
        academic_checks["graduation_year"] = {
            "eligible": eligible_years,
            "student": student_year,
            "passed": passed,
        }
        if not passed:
            is_eligible = False
            reasons.append(f"Graduation year {student_year} is not in eligible batch years.")
    else:
        academic_checks["graduation_year"] = {"eligible": eligible_years, "student": student_year, "passed": True}

    eligibility_status = "eligible" if is_eligible else "ineligible"

    return ApiResponse(
        data=EligibilityCheckResponse(
            job_id=job_id,
            is_eligible=is_eligible,
            eligibility_status=eligibility_status,
            academic_checks=academic_checks,
            missing_criteria=missing_criteria,
            reasons=reasons,
        )
    )


@router.post("", response_model=ApiResponse[JobResponse], status_code=status.HTTP_201_CREATED)
def create_job_posting(
    payload: JobCreate,
    recruiter_ctx: Dict[str, Any] = Depends(get_current_recruiter),
    db: Database = Depends(get_database),
) -> Any:
    """Publishes a new job listing with eligibility criteria (recruiter only)."""
    if not ObjectId.is_valid(payload.company_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid company ID.")

    company = db["companies"].find_one({"_id": ObjectId(payload.company_id)})
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found.")

    now = datetime.now()
    doc = payload.model_dump()
    doc["company_id"] = ObjectId(payload.company_id)
    doc["created_at"] = now
    doc["updated_at"] = now

    result = db["jobs"].insert_one(doc)
    doc["_id"] = result.inserted_id

    return ApiResponse(
        message="Job posting created successfully.",
        data=JobResponse(
            id=str(doc["_id"]),
            company_id=str(doc["company_id"]),
            company_name=company.get("name"),
            title=doc["title"],
            description=doc["description"],
            location=doc["location"],
            employment_type=doc["employment_type"],
            min_cgpa=doc.get("min_cgpa"),
            eligible_departments=doc.get("eligible_departments", []),
            eligible_degrees=doc.get("eligible_degrees", []),
            graduation_years=doc.get("graduation_years", []),
            required_skills=[str(s) for s in doc.get("required_skills", [])],
            preferred_skills=[str(s) for s in doc.get("preferred_skills", [])],
            package_details=doc.get("package_details"),
            application_url=doc.get("application_url"),
            deadline=doc.get("deadline"),
            status=doc.get("status", "published"),
            source_name=doc.get("source_name", "Campus Placement"),
            source_url=doc.get("source_url"),
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
        ),
    )


@router.get("/{job_id}/requirements", response_model=ApiResponse[List[JobRequirementResponse]])
def list_job_requirements(
    job_id: str,
    db: Database = Depends(get_database),
) -> Any:
    """Lists skill requirements mapped to a job."""
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid job ID.")

    reqs_cursor = db["job_requirements"].find({"job_id": ObjectId(job_id)})
    results = []
    for r in reqs_cursor:
        skill = db["skills"].find_one({"_id": r.get("skill_id")})
        results.append(
            JobRequirementResponse(
                id=str(r["_id"]),
                job_id=str(r["job_id"]),
                skill_id=str(r["skill_id"]),
                skill_name=skill.get("name") if skill else None,
                importance=r.get("importance", "high"),
                mandatory=r.get("mandatory", True),
                minimum_proficiency=r.get("minimum_proficiency", "intermediate"),
                created_at=r.get("created_at", datetime.now()),
            )
        )
    return ApiResponse(data=results)


@router.post(
    "/{job_id}/requirements",
    response_model=ApiResponse[JobRequirementResponse],
    status_code=status.HTTP_201_CREATED,
)
def add_job_requirement(
    job_id: str,
    payload: JobRequirementCreate,
    recruiter_ctx: Dict[str, Any] = Depends(get_current_recruiter),
    db: Database = Depends(get_database),
) -> Any:
    """Adds a skill requirement to a job."""
    if not ObjectId.is_valid(job_id) or not ObjectId.is_valid(payload.skill_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid job ID or skill ID.")

    skill = db["skills"].find_one({"_id": ObjectId(payload.skill_id)})
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found.")

    now = datetime.now()
    doc = {
        "job_id": ObjectId(job_id),
        "skill_id": ObjectId(payload.skill_id),
        "importance": payload.importance,
        "mandatory": payload.mandatory,
        "minimum_proficiency": payload.minimum_proficiency,
        "created_at": now,
    }

    res = db["job_requirements"].find_one_and_update(
        {"job_id": ObjectId(job_id), "skill_id": ObjectId(payload.skill_id)},
        {"$set": doc, "$setOnInsert": {"_id": ObjectId()}},
        upsert=True,
        return_document=True,
    )

    return ApiResponse(
        message="Requirement added.",
        data=JobRequirementResponse(
            id=str(res["_id"]),
            job_id=str(res["job_id"]),
            skill_id=str(res["skill_id"]),
            skill_name=skill.get("name"),
            importance=res.get("importance", payload.importance),
            mandatory=res.get("mandatory", payload.mandatory),
            minimum_proficiency=res.get("minimum_proficiency", payload.minimum_proficiency),
            created_at=res.get("created_at", now),
        ),
    )
