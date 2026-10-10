"""Student and Recruiter profile schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# --- Student Profile Schemas ---


# --- Student Profile Sub-Models ---


class SocialLinks(BaseModel):
    github: Optional[str] = None
    linkedin: Optional[str] = None
    leetcode: Optional[str] = None
    instagram: Optional[str] = None
    portfolio: Optional[str] = None


class ProjectItem(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    technologies: List[str] = Field(default_factory=list)
    role: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    category: Optional[str] = "Full Stack Web"
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    image_url: Optional[str] = None


class EducationItem(BaseModel):
    id: Optional[str] = None
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    grade: Optional[str] = None


class ExperienceItem(BaseModel):
    id: Optional[str] = None
    title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None


class CertificationItem(BaseModel):
    id: Optional[str] = None
    name: str
    issuing_organization: str
    issue_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None


class AchievementItem(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    date_received: Optional[str] = None


# --- Student Profile Schemas ---


class StudentProfileCreate(BaseModel):
    register_number: str = Field(min_length=1)
    department: str = Field(min_length=1)
    degree: str = Field(min_length=1)
    graduation_year: int = Field(ge=1990, le=2100)
    cgpa: float = Field(ge=0.0, le=10.0)
    active_backlogs: Optional[int] = 0
    profession: Optional[str] = "Full Stack Software Engineer"
    profile_summary: Optional[str] = None


class StudentProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    current_year: Optional[int] = None
    current_semester: Optional[int] = None
    department: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = Field(default=None, ge=1990, le=2100)
    cgpa: Optional[float] = Field(default=None, ge=0.0, le=10.0)
    register_number: Optional[str] = None
    active_backlogs: Optional[int] = Field(default=None, ge=0)
    location: Optional[str] = None
    profession: Optional[str] = None
    headline: Optional[str] = None
    profile_summary: Optional[str] = None
    avatar_url: Optional[str] = None
    resume_url: Optional[str] = None
    resume_filename: Optional[str] = None
    social_links: Optional[Any] = None
    projects: Optional[List[ProjectItem]] = None
    education: Optional[List[EducationItem]] = None
    experience: Optional[List[ExperienceItem]] = None
    certifications: Optional[List[CertificationItem]] = None
    achievements: Optional[List[AchievementItem]] = None
    academic_record: Optional[Dict[str, Any]] = None


class StudentProfileResponse(BaseModel):
    id: str
    user_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    register_number: str
    phone: Optional[str] = None
    department: str
    degree: str
    college: Optional[str] = "Amrita Vishwa Vidyapeetham"
    current_year: Optional[int] = 3
    current_semester: Optional[int] = 6
    graduation_year: int
    cgpa: float
    active_backlogs: Optional[int] = 0
    location: Optional[str] = None
    profession: Optional[str] = "Full Stack Software Engineer"
    headline: Optional[str] = None
    profile_summary: Optional[str] = None
    avatar_url: Optional[str] = None
    resume_url: Optional[str] = None
    resume_filename: Optional[str] = None
    resume_updated_at: Optional[datetime] = None
    social_links: Optional[SocialLinks] = None
    projects: List[ProjectItem] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)
    experience: List[ExperienceItem] = Field(default_factory=list)
    certifications: List[CertificationItem] = Field(default_factory=list)
    achievements: List[AchievementItem] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class StudentSkillCreate(BaseModel):
    skill_id: Optional[str] = None
    skill_name: Optional[str] = None
    category: Optional[str] = "Technical Skills"
    proficiency: str = Field(pattern="^(beginner|intermediate|advanced|expert)$", default="intermediate")
    evidence: Optional[Any] = None


class BatchStudentSkillItem(BaseModel):
    skill_id: Optional[str] = None
    skill_name: Optional[str] = None
    category: Optional[str] = "Technical Skills"
    proficiency: str = Field(pattern="^(beginner|intermediate|advanced|expert)$", default="intermediate")
    evidence: Optional[Any] = None


class BatchStudentSkillCreate(BaseModel):
    skills: List[BatchStudentSkillItem]


class StudentSkillResponse(BaseModel):
    id: str
    student_id: str
    skill_id: str
    skill_name: Optional[str] = None
    category: Optional[str] = None
    proficiency: str
    evidence: Optional[Any] = None
    updated_at: datetime


class ExtractedSkillItem(BaseModel):
    skill_id: Optional[str] = None
    skill_name: str
    category: str = "Technical Skills"
    proficiency: str = "intermediate"
    evidence: Optional[str] = None
    confidence: float = 0.8
    match_count: int = 1


class ResumeExtractResponse(BaseModel):
    extracted_skills: List[ExtractedSkillItem]
    total_skills: int
    summary: str
    sections_found: List[str] = []
    file_name: Optional[str] = None
    resume_id: Optional[str] = None


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
