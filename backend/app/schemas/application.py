"""Application Schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ApplicationCreate(BaseModel):
    job_id: str
    resume_id: Optional[str] = None
    notes: Optional[str] = None
    source: str = "portal"


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(
        pattern="^(applied|in_review|shortlisted|assessment_scheduled|interview_scheduled|offered|rejected|withdrawn)$"
    )
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: str
    student_id: str
    student_name: Optional[str] = None
    job_id: str
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    resume_id: Optional[str] = None
    applied_at: datetime
    status: str
    source: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
