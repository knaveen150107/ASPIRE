"""Company, Job, and Skill Schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


# --- Company Schemas ---


class CompanyCreate(BaseModel):
    name: str = Field(min_length=1)
    website: Optional[str] = None
    industry: str = Field(min_length=1)
    description: str = Field(min_length=1)


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None


class CompanyResponse(BaseModel):
    id: str
    name: str
    website: Optional[str] = None
    industry: str
    description: str
    recruiter_id: str
    created_at: datetime
    updated_at: datetime


# --- Skill Schemas ---


class SkillCreate(BaseModel):
    name: str = Field(min_length=1)
    category: str = Field(min_length=1)
    description: Optional[str] = None


class SkillResponse(BaseModel):
    id: str
    name: str
    category: str
    description: Optional[str] = None
    created_at: datetime


# --- Job Requirement Schemas ---


class JobRequirementCreate(BaseModel):
    skill_id: str
    importance: str = Field(pattern="^(critical|high|medium|low)$", default="high")
    mandatory: bool = True
    minimum_proficiency: str = Field(pattern="^(beginner|intermediate|advanced|expert)$", default="intermediate")


class JobRequirementResponse(BaseModel):
    id: str
    job_id: str
    skill_id: str
    skill_name: Optional[str] = None
    importance: str
    mandatory: bool
    minimum_proficiency: str
    created_at: datetime


# --- Job Schemas ---


class JobCreate(BaseModel):
    company_id: str
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    location: str = Field(min_length=1)
    employment_type: str = Field(pattern="^(full_time|part_time|internship|contract)$", default="full_time")
    min_cgpa: Optional[float] = Field(default=None, ge=0.0, le=10.0)
    eligible_departments: List[str] = Field(default_factory=list)
    eligible_degrees: List[str] = Field(default_factory=list)
    graduation_years: List[int] = Field(default_factory=list)
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    package_details: Optional[Union[Dict[str, Any], str]] = None
    application_url: Optional[str] = None
    deadline: Optional[datetime] = None
    status: str = Field(pattern="^(draft|published|closed|archived)$", default="published")
    source_name: str = "Campus Placement"
    source_url: Optional[str] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = Field(default=None, pattern="^(full_time|part_time|internship|contract)$")
    min_cgpa: Optional[float] = Field(default=None, ge=0.0, le=10.0)
    eligible_departments: Optional[List[str]] = None
    eligible_degrees: Optional[List[str]] = None
    graduation_years: Optional[List[int]] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    package_details: Optional[Union[Dict[str, Any], str]] = None
    application_url: Optional[str] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = Field(default=None, pattern="^(draft|published|closed|archived)$")


class JobResponse(BaseModel):
    id: str
    company_id: str
    company_name: Optional[str] = None
    title: str
    description: str
    location: str
    employment_type: str
    min_cgpa: Optional[float] = None
    eligible_departments: List[str]
    eligible_degrees: List[str]
    graduation_years: List[int]
    required_skills: List[str]
    preferred_skills: List[str]
    package_details: Optional[Union[Dict[str, Any], str]] = None
    application_url: Optional[str] = None
    deadline: Optional[datetime] = None
    status: str
    source_name: str
    source_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class EligibilityCheckResponse(BaseModel):
    job_id: str
    is_eligible: bool
    eligibility_status: str  # eligible, ineligible, partially_eligible, unknown
    academic_checks: Dict[str, Any]
    missing_criteria: List[str]
    reasons: List[str]
