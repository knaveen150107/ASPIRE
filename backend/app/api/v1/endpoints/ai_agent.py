"""AI Agent Router — Endpoints for Copilot Chat, Roadmaps, Mock Tests, Resume ATS, and Agent Management."""

from datetime import datetime
from typing import Any, Dict, List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.core.deps import get_current_admin, get_current_student, get_current_user, get_database
from app.schemas.ai_agent import (
    AiAgentStatusResponse,
    AiChatRequest,
    AiChatResponse,
    AiEvaluateSubmissionRequest,
    AiEvaluateSubmissionResponse,
    AiJobFitRequest,
    AiJobFitResponse,
    AiMockTestRequest,
    AiMockTestResponse,
    AiResumeAnalysisRequest,
    AiResumeAnalysisResponse,
    AiRoadmapRequest,
    AiRoadmapResponse,
    AiTriggerCycleRequest,
    AiUpdateKeyRequest,
)
from app.schemas.common import ApiResponse
from app.services.gemini_agent_service import ai_agent_service

router = APIRouter()


@router.get("/status", response_model=ApiResponse[AiAgentStatusResponse])
def get_ai_agent_status() -> Any:
    """Returns the operational status, current Gemini model, and configured capabilities."""
    is_conf = ai_agent_service.is_configured
    status_label = "active" if is_conf else "standby_heuristic"
    return ApiResponse(
        data=AiAgentStatusResponse(
            status=status_label,
            model="gemini-3.6-flash" if is_conf else "aspire-heuristic-engine (Provide API Key to activate Gemini 3.6 Flash)",
            gemini_key_configured=is_conf,
            autonomous_cycle_interval_hours=6,
            active_tools_count=6,
            supported_features=[
                "AI Career & Placement Copilot",
                "Dynamic Remedial Learning Roadmap Generator",
                "Company-Specific Mock Assessment Question Generator",
                "Automated Assessment Diagnostic Evaluator",
                "Deep ATS Resume Analyzer & Bullet Rewriter",
                "Job Fit Radar & Prerequisite Explainer",
                "Autonomous Background Placement Matching Agent",
            ],
        )
    )


@router.post("/chat", response_model=ApiResponse[AiChatResponse])
def chat_with_ai_copilot(
    payload: AiChatRequest,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Interactive placement and career assistant for authenticated students."""
    user = student_ctx["user"]
    profile = student_ctx["profile"]

    # Retrieve skills
    skills_cursor = db["student_skills"].find({"student_id": profile["_id"]})
    skills_list = [s.get("skill_name") for s in skills_cursor if s.get("skill_name")]

    student_data = {
        "name": user.get("name", "Student"),
        "department": profile.get("department", "Computer Science"),
        "degree": profile.get("degree", "B.Tech"),
        "cgpa": profile.get("cgpa", 8.2),
        "skills": skills_list or ["Python", "Algorithms", "SQL"],
    }

    history_dicts = [{"role": h.role, "content": h.content} for h in (payload.history or [])]
    result = ai_agent_service.chat_with_copilot(
        message=payload.message,
        history=history_dicts,
        student_context=student_data,
        target_role=payload.target_role,
        target_company=payload.target_company,
    )

    return ApiResponse(data=AiChatResponse(**result))


@router.post("/generate-roadmap", response_model=ApiResponse[AiRoadmapResponse])
def generate_ai_roadmap(
    payload: AiRoadmapRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
) -> Any:
    """Generates a custom week-by-week remedial learning roadmap for any target role."""
    result = ai_agent_service.generate_roadmap(
        target_role=payload.target_role,
        target_company=payload.target_company or "Tier-1 Tech Companies",
        current_skills=payload.current_skills,
        missing_skills=payload.missing_skills,
        target_weeks=payload.target_weeks or 6,
    )
    return ApiResponse(data=AiRoadmapResponse(**result))


@router.post("/generate-mock-test", response_model=ApiResponse[AiMockTestResponse])
def generate_mock_assessment(
    payload: AiMockTestRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Any:
    """Dynamically generates company-tailored assessment multiple choice questions."""
    result = ai_agent_service.generate_mock_questions(
        company_name=payload.company_name or "Google",
        role_title=payload.role_title or "Software Engineer",
        category=payload.category or "DSA",
        difficulty=payload.difficulty or "medium",
        num_questions=payload.num_questions or 5,
    )
    return ApiResponse(data=AiMockTestResponse(**result))


@router.post("/evaluate-mock-test", response_model=ApiResponse[AiEvaluateSubmissionResponse])
def evaluate_mock_submission(
    payload: AiEvaluateSubmissionRequest,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Scores a student's mock test submission, providing strengths, flaws, and revision steps."""
    submissions_dicts = [s.model_dump() for s in payload.submissions]
    result = ai_agent_service.evaluate_submission(
        submissions=submissions_dicts,
        company_name=payload.company_name,
        role_title=payload.role_title,
    )

    # Record mock test attempt in db
    profile = student_ctx["profile"]
    now = datetime.now()
    db["mock_tests"].insert_one({
        "student_id": profile["_id"],
        "company_name": payload.company_name or "Practice Test",
        "role_title": payload.role_title or "Software Engineer",
        "score_percentage": result["score_percentage"],
        "correct_count": result["correct_count"],
        "total_count": result["total_count"],
        "readiness_rating": result["readiness_rating"],
        "created_at": now,
    })

    return ApiResponse(data=AiEvaluateSubmissionResponse(**result))


@router.post("/analyze-resume", response_model=ApiResponse[AiResumeAnalysisResponse])
def analyze_resume_ats(
    payload: AiResumeAnalysisRequest,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Performs deep ATS scoring, keyword detection, and bullet improvements on student resume."""
    profile = student_ctx["profile"]
    resume_text = payload.resume_text

    if not resume_text:
        # Fetch uploaded resume text if available
        resume_doc = db["resumes"].find_one({"student_id": profile["_id"]}, sort=[("created_at", -1)])
        if resume_doc and resume_doc.get("extracted_text"):
            resume_text = resume_doc["extracted_text"]
        else:
            resume_text = (
                f"Engineering candidate proficient in {profile.get('department', 'Computer Science')}, "
                f"CGPA: {profile.get('cgpa', 8.2)}, seeking roles in {payload.target_role}."
            )

    result = ai_agent_service.analyze_resume(
        resume_text=resume_text,
        target_role=payload.target_role or "Software Development Engineer",
    )
    return ApiResponse(data=AiResumeAnalysisResponse(**result))


@router.post("/explain-job-fit", response_model=ApiResponse[AiJobFitResponse])
def explain_job_fit(
    payload: AiJobFitRequest,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Explains why a student matches a job opening and details steps to bridge any remaining gaps."""
    if not ObjectId.is_valid(payload.job_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid job ID.")

    job = db["jobs"].find_one({"_id": ObjectId(payload.job_id)})
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job opening not found.")

    profile = student_ctx["profile"]
    skills_cursor = db["student_skills"].find({"student_id": profile["_id"]})
    student_skills = [s.get("skill_name") for s in skills_cursor if s.get("skill_name")] or ["Python", "SQL", "Git"]

    result = ai_agent_service.explain_job_fit(
        job_data=job,
        student_profile=profile,
        student_skills=student_skills,
    )
    return ApiResponse(data=AiJobFitResponse(**result))


@router.post("/admin/update-key", response_model=ApiResponse[bool])
def update_gemini_api_key(
    payload: AiUpdateKeyRequest,
    admin_user: Dict[str, Any] = Depends(get_current_admin),
    db: Database = Depends(get_database),
) -> Any:
    """Configures or updates the Gemini API Key dynamically from the Admin UI."""
    ai_agent_service.set_api_key(payload.gemini_api_key)

    # Log audit event
    admin_obj_id = admin_user.get("_id") or (ObjectId(admin_user["id"]) if admin_user.get("id") and ObjectId.is_valid(admin_user["id"]) else None)
    db["audit_logs"].insert_one({
        "user_id": admin_obj_id,
        "action": "ADMIN_UPDATE_GEMINI_KEY",
        "entity_type": "ai_agent",
        "entity_id": admin_obj_id,
        "metadata": {"key_prefix": payload.gemini_api_key[:6] + "******"},
        "created_at": datetime.now(),
    })

    return ApiResponse(message="Gemini API Key configured successfully. Live Gemini 3.6 Flash engine is now active!", data=True)


@router.post("/admin/run-cycle", response_model=ApiResponse[Dict[str, Any]])
def trigger_autonomous_agent_cycle(
    payload: AiTriggerCycleRequest,
    admin_user: Dict[str, Any] = Depends(get_current_admin),
    db: Database = Depends(get_database),
) -> Any:
    """Manually triggers the background autonomous placement matching cycle."""
    result = ai_agent_service.run_autonomous_matching_cycle(
        db=db,
        admin_user=admin_user,
        dry_run=payload.dry_run or False,
    )
    return ApiResponse(message="Autonomous placement cycle completed successfully.", data=result)
