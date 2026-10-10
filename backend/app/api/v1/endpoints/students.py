"""Student Profile and Skills Router."""

import re
from datetime import datetime
from typing import Any, Dict, List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pymongo.database import Database

from app.core.deps import get_current_student, get_database
from app.schemas.common import ApiResponse
from app.schemas.student import (
    BatchStudentSkillCreate,
    ExtractedSkillItem,
    ResumeExtractResponse,
    StudentProfileResponse,
    StudentProfileUpdate,
    StudentSkillCreate,
    StudentSkillResponse,
)
from app.services.resume_rag_service import ResumeRAGService

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
            cgpa=float(profile.get("cgpa", 0.0)),
            active_backlogs=profile.get("active_backlogs", 0),
            profession=profile.get("profession", "Full Stack Software Engineer"),
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

    raw_data = payload.model_dump(exclude_unset=True)

    # Unpack nested academic_record if sent by frontend
    if "academic_record" in raw_data and isinstance(raw_data["academic_record"], dict):
        rec = raw_data.pop("academic_record")
        for k in ["department", "degree", "graduation_year", "cgpa", "active_backlogs", "profession"]:
            if k in rec and rec[k] is not None:
                raw_data[k] = rec[k]

    update_fields: Dict[str, Any] = {"updated_at": datetime.now()}

    if "department" in raw_data and raw_data["department"] is not None:
        update_fields["department"] = str(raw_data["department"]).strip()
    if "degree" in raw_data and raw_data["degree"] is not None:
        update_fields["degree"] = str(raw_data["degree"]).strip()
    if "graduation_year" in raw_data and raw_data["graduation_year"] is not None:
        update_fields["graduation_year"] = int(raw_data["graduation_year"])
    if "cgpa" in raw_data and raw_data["cgpa"] is not None:
        update_fields["cgpa"] = float(raw_data["cgpa"])
    if "active_backlogs" in raw_data and raw_data["active_backlogs"] is not None:
        update_fields["active_backlogs"] = int(raw_data["active_backlogs"])
    if "profession" in raw_data and raw_data["profession"] is not None:
        update_fields["profession"] = str(raw_data["profession"]).strip()
    if "register_number" in raw_data and raw_data["register_number"] is not None:
        update_fields["register_number"] = str(raw_data["register_number"]).strip()
    if "profile_summary" in raw_data and raw_data["profile_summary"] is not None:
        update_fields["profile_summary"] = str(raw_data["profile_summary"]).strip()

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
            cgpa=float(updated_profile.get("cgpa", 0.0)),
            active_backlogs=updated_profile.get("active_backlogs", 0),
            profession=updated_profile.get("profession", "Full Stack Software Engineer"),
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


def clean_evidence(evidence: Any) -> Optional[str]:
    """Formats evidence for student_skills schema validation."""
    if evidence is None:
        return None
    if isinstance(evidence, list):
        return ", ".join(str(e) for e in evidence if e)
    if isinstance(evidence, dict):
        return ", ".join(f"{k}: {v}" for k, v in evidence.items())
    return str(evidence)


def resolve_or_create_skill(
    db: Database,
    skill_id: Optional[str] = None,
    skill_name: Optional[str] = None,
    category: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Resolves a skill by ObjectId or case-insensitive name, creating it if absent."""
    # 1. Try finding by ObjectId if valid
    if skill_id and ObjectId.is_valid(skill_id):
        skill_doc = db["skills"].find_one({"_id": ObjectId(skill_id)})
        if skill_doc:
            return skill_doc

    # 2. Try finding by name
    target_name = (skill_name or skill_id or "").strip()
    if not target_name:
        return None

    skill_doc = db["skills"].find_one({"name": {"$regex": f"^{re.escape(target_name)}$", "$options": "i"}})
    if skill_doc:
        return skill_doc

    # 3. Create new canonical skill in db["skills"]
    now = datetime.now()
    new_doc = {
        "name": target_name,
        "category": category or "Technical Skills",
        "description": f"User-added skill: {target_name}",
        "created_at": now,
    }
    result = db["skills"].insert_one(new_doc)
    new_doc["_id"] = result.inserted_id
    return new_doc


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

    skill_doc = resolve_or_create_skill(db, payload.skill_id, payload.skill_name, payload.category)
    if not skill_doc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please provide a valid skill ID or skill name.")

    skill_oid = skill_doc["_id"]
    now = datetime.now()
    evidence_val = clean_evidence(payload.evidence)

    # Upsert student skill
    result = db["student_skills"].find_one_and_update(
        {"student_id": profile["_id"], "skill_id": skill_oid},
        {
            "$set": {
                "proficiency": payload.proficiency,
                "evidence": evidence_val,
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


@router.post("/me/skills/batch", response_model=ApiResponse[List[StudentSkillResponse]], status_code=status.HTTP_201_CREATED)
def batch_add_my_skills(
    payload: BatchStudentSkillCreate,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Batch adds or updates multiple student skills (e.g. from resume RAG extraction)."""
    profile = student_ctx["profile"]
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found.")

    results = []
    now = datetime.now()
    for item in payload.skills:
        skill_doc = resolve_or_create_skill(db, item.skill_id, item.skill_name, item.category)
        if not skill_doc:
            continue

        skill_oid = skill_doc["_id"]
        evidence_val = clean_evidence(item.evidence)

        res = db["student_skills"].find_one_and_update(
            {"student_id": profile["_id"], "skill_id": skill_oid},
            {
                "$set": {
                    "proficiency": item.proficiency,
                    "evidence": evidence_val,
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
        results.append(
            StudentSkillResponse(
                id=str(res["_id"]),
                student_id=str(profile["_id"]),
                skill_id=str(skill_oid),
                skill_name=skill_doc.get("name"),
                category=skill_doc.get("category"),
                proficiency=res.get("proficiency", item.proficiency),
                evidence=res.get("evidence"),
                updated_at=res.get("updated_at", now),
            )
        )

    return ApiResponse(
        message=f"Successfully imported {len(results)} skills into your profile.",
        data=results,
    )


@router.post("/me/resume/extract-skills", response_model=ApiResponse[ResumeExtractResponse])
async def extract_skills_from_student_resume(
    file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    save_as_master: bool = Form(True),
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Uploads a student resume (PDF/DOCX/TXT) or raw text and runs the RAG pipeline

    to extract skills, evidence citations, and proficiency levels.
    """
    profile = student_ctx["profile"]
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found.")

    text = ""
    filename = "resume.txt"
    file_type = "txt"
    file_url = "uploaded_text"

    if file:
        filename = file.filename or "resume.pdf"
        file_ext = filename.lower().split(".")[-1] if "." in filename else "pdf"
        file_type = file_ext if file_ext in ["pdf", "docx", "json"] else "pdf"
        file_bytes = await file.read()
        text = ResumeRAGService.extract_text(filename, file_bytes)
        file_url = f"uploads/{ObjectId()}_{filename}"
    elif resume_text:
        text = resume_text.strip()
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please upload a resume file or paste resume text.")

    if not text or len(text.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract readable text from the provided file. Ensure it is not an image-only scanned document.",
        )

    # Execute RAG ontology matching
    analysis = ResumeRAGService.analyze_resume_skills(text, db)

    resume_id = None
    if save_as_master and file:
        now = datetime.now()
        resume_doc = {
            "student_id": profile["_id"],
            "title": f"Resume - {filename}",
            "file_url": file_url,
            "file_type": file_type,
            "created_at": now,
            "updated_at": now,
        }
        res = db["resumes"].insert_one(resume_doc)
        resume_id = str(res.inserted_id)

    return ApiResponse(
        message=f"RAG Analysis complete: {analysis['total_skills']} skills extracted with citations.",
        data=ResumeExtractResponse(
            extracted_skills=analysis["extracted_skills"],
            total_skills=analysis["total_skills"],
            summary=analysis["summary"],
            sections_found=analysis["sections_found"],
            file_name=filename,
            resume_id=resume_id,
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
