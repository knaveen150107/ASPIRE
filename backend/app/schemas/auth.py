"""Authentication and User API Schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)
    role: str = Field(pattern="^(student|recruiter|admin)$", default="student")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str
    role: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Enriched profile metadata
    register_number: Optional[str] = None
    department: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    active_backlogs: Optional[int] = None
    skills_count: Optional[int] = 0
    resume_uploaded: Optional[bool] = False
    company_name: Optional[str] = None


class CreateRecruiterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)
    company_name: Optional[str] = "TechCorp Solutions"
    designation: Optional[str] = "Talent Acquisition Lead"

