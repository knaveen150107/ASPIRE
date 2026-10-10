"""Student and Recruiter profile schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# --- Student Profile Schemas ---


class StudentProfileCreate(BaseModel):
    register_number: str = Field(min_length=1)
    department: str = Field(min_length=1)
    degree: str = Field(min_length=1)
    graduation_year: int = Field(ge=1990, le=2100)
    cgpa: float = Field(ge=0.0, le=10.0)
    profile_summary: Optional[str] = None


class StudentProfileUpdate(BaseModel):
    department: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = Field(default=None, ge=1990, le=2100)
    cgpa: Optional[float] = Field(default=None, ge=0.0, le=10.0)
    profile_summary: Optional[str] = None


class StudentProfileResponse(BaseModel):
    id: str
    user_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    register_number: str
    department: str
    degree: str
    graduation_year: int
    cgpa: float
    profile_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class StudentSkillCreate(BaseModel):
    skill_id: str
    proficiency: str = Field(pattern="^(beginner|intermediate|advanced|expert)$")
    evidence: Optional[Dict[str, Any]] = None


class StudentSkillResponse(BaseModel):
    id: str
    student_id: str
    skill_id: str
    skill_name: Optional[str] = None
    category: Optional[str] = None
    proficiency: str
    evidence: Optional[Any] = None
    updated_at: datetime


# --- Recruiter Profile Schemas ---


class RecruiterProfileCreate(BaseModel):
    designation: str = Field(min_length=1)
    organization_email: str
    verified: bool = False


class RecruiterProfileUpdate(BaseModel):
    designation: Optional[str] = None
    organization_email: Optional[str] = None


class RecruiterProfileResponse(BaseModel):
    id: str
    user_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    designation: str
    organization_email: str
    verified: bool
    created_at: datetime
    updated_at: datetime
