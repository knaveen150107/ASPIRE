"""Skill Gap Analysis, Roadmap, and Resume Schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# --- Skill Gap Schemas ---


class SkillGapItemCreate(BaseModel):
    skill_id: str
    current_level: str = Field(pattern="^(none|beginner|intermediate|advanced)$", default="none")
    target_level: str = Field(pattern="^(beginner|intermediate|advanced|expert)$", default="intermediate")
    priority: str = Field(pattern="^(critical|high|medium|low)$", default="high")


class SkillGapItemResponse(BaseModel):
    id: str
    report_id: str
    skill_id: str
    skill_name: Optional[str] = None
    current_level: str
    target_level: str
    priority: str
    created_at: datetime


class SkillGapReportCreate(BaseModel):
    job_id: str
    readiness_score: float = Field(ge=0.0, le=100.0)
    summary: str
    gaps: List[SkillGapItemCreate] = Field(default_factory=list)


class SkillGapReportResponse(BaseModel):
    id: str
    student_id: str
    job_id: str
    job_title: Optional[str] = None
    readiness_score: float
    summary: str
    gaps: List[SkillGapItemResponse] = Field(default_factory=list)
    generated_at: datetime


# --- Roadmap Schemas ---


class RoadmapStepCreate(BaseModel):
    skill_id: str
    title: str = Field(min_length=1)
    description: str
    resource_url: Optional[str] = None
    sequence_number: int = Field(ge=1)


class RoadmapStepUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    resource_url: Optional[str] = None
    status: Optional[str] = Field(default=None, pattern="^(pending|in_progress|completed|skipped)$")


class RoadmapStepResponse(BaseModel):
    id: str
    roadmap_id: str
    skill_id: str
    skill_name: Optional[str] = None
    title: str
    description: str
    resource_url: Optional[str] = None
    sequence_number: int
    status: str
    created_at: datetime
    updated_at: datetime


class RoadmapCreate(BaseModel):
    report_id: Optional[str] = None
    title: str = Field(min_length=1)
    target_date: Optional[datetime] = None
    steps: List[RoadmapStepCreate] = Field(default_factory=list)


class RoadmapResponse(BaseModel):
    id: str
    student_id: str
    report_id: Optional[str] = None
    title: str
    target_date: Optional[datetime] = None
    status: str
    steps: List[RoadmapStepResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


# --- Resume Schemas ---


class ResumeCreate(BaseModel):
    title: str = Field(min_length=1)
    file_url: str
    file_type: str = Field(pattern="^(pdf|docx|json)$", default="pdf")


class ResumeResponse(BaseModel):
    id: str
    student_id: str
    title: str
    file_url: str
    file_type: str
    created_at: datetime
    updated_at: datetime


class ResumeVersionCreate(BaseModel):
    job_id: Optional[str] = None
    content: Dict[str, Any]
    file_url: Optional[str] = None


class ResumeVersionResponse(BaseModel):
    id: str
    resume_id: str
    job_id: Optional[str] = None
    job_title: Optional[str] = None
    content: Dict[str, Any]
    file_url: Optional[str] = None
    version_number: int
    created_at: datetime
