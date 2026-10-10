"""Pydantic schemas for AI Agent, Copilot Chat, Roadmaps, Assessments, and Telemetry."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# --- Copilot Chat Schemas ---

class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|model|assistant|system)$")
    content: str


class AiChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    history: Optional[List[ChatMessage]] = None
    target_role: Optional[str] = None
    target_company: Optional[str] = None


class AiChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = None
    model_used: str
    created_at: datetime


# --- AI Roadmap Generation Schemas ---

class AiRoadmapTopic(BaseModel):
    name: str
    description: str
    key_concepts: List[str]
    resource_links: Optional[List[Dict[str, str]]] = None


class AiRoadmapModule(BaseModel):
    week_number: int
    title: str
    topics: List[AiRoadmapTopic]
    milestone_project: Optional[str] = None


class AiRoadmapRequest(BaseModel):
    target_role: str
    target_company: Optional[str] = "Tier-1 Tech Companies"
    current_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    target_weeks: Optional[int] = 6


class AiRoadmapResponse(BaseModel):
    role_title: str
    target_company: str
    summary: str
    estimated_duration_weeks: int
    modules: List[AiRoadmapModule]
    model_used: str
    generated_at: datetime


# --- AI Mock Test Question Generator Schemas ---

class QuestionOption(BaseModel):
    id: str
    text: str


class AiGeneratedQuestion(BaseModel):
    id: str
    question_text: str
    category: str
    difficulty: str = "medium"
    code_snippet: Optional[str] = None
    options: List[QuestionOption]
    correct_option_id: str
    explanation: str


class AiMockTestRequest(BaseModel):
    company_name: Optional[str] = "Google"
    role_title: Optional[str] = "Software Engineer"
    category: Optional[str] = "DSA"
    difficulty: Optional[str] = "medium"
    num_questions: Optional[int] = Field(default=5, ge=1, le=15)


class AiMockTestResponse(BaseModel):
    title: str
    company_name: str
    category: str
    difficulty: str
    duration_minutes: int
    questions: List[AiGeneratedQuestion]
    model_used: str
    generated_at: datetime


# --- AI Mock Submission Evaluator Schemas ---

class QuestionSubmissionItem(BaseModel):
    question_id: str
    question_text: str
    selected_option_id: Optional[str] = None
    correct_option_id: str
    category: Optional[str] = None


class AiEvaluateSubmissionRequest(BaseModel):
    submissions: List[QuestionSubmissionItem]
    company_name: Optional[str] = None
    role_title: Optional[str] = None


class AiEvaluateSubmissionResponse(BaseModel):
    score_percentage: float
    correct_count: int
    total_count: int
    strengths: List[str]
    weaknesses: List[str]
    improvement_plan: List[str]
    readiness_rating: str  # e.g., "Interview Ready", "Approaching Target", "Needs Foundation"
    model_used: str


# --- AI Resume ATS Deep Analysis Schemas ---

class AiResumeAnalysisRequest(BaseModel):
    resume_text: Optional[str] = None
    target_role: Optional[str] = "Software Development Engineer"


class AiResumeAnalysisResponse(BaseModel):
    ats_score: int  # 0 to 100
    candidate_level: str  # Entry-level, Intermediate, Senior
    top_strengths: List[str]
    critical_flaws: List[str]
    missing_keywords: List[str]
    bullet_improvements: List[Dict[str, str]]  # { original: "...", improved: "...", reason: "..." }
    overall_summary: str
    model_used: str


# --- AI Job Matching Explainer Schemas ---

class AiJobFitRequest(BaseModel):
    job_id: str


class AiJobFitResponse(BaseModel):
    job_id: str
    job_title: str
    company_name: str
    overall_match_score: float
    eligible: bool
    eligibility_reasons: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    tailored_advice: str
    recommended_projects: List[str]
    model_used: str


# --- AI Agent Telemetry & Admin Configuration Schemas ---

class AiAgentStatusResponse(BaseModel):
    status: str  # "active" | "standby_no_key"
    model: str
    gemini_key_configured: bool
    autonomous_cycle_interval_hours: int
    active_tools_count: int
    supported_features: List[str]


class AiUpdateKeyRequest(BaseModel):
    gemini_api_key: str = Field(min_length=10)


class AiTriggerCycleRequest(BaseModel):
    dry_run: Optional[bool] = False
