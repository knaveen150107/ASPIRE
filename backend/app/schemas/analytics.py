"""Performance Analytics, Notifications, and Audit Log Schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


# --- Performance Record Schemas ---


class PerformanceRecordCreate(BaseModel):
    job_id: str
    skill_match_score: float = Field(ge=0.0, le=100.0)
    eligibility_status: str = Field(pattern="^(eligible|ineligible|partially_eligible|unknown)$")
    eligibility_reason: Optional[Union[str, List[str]]] = None


class PerformanceRecordResponse(BaseModel):
    id: str
    student_id: str
    job_id: str
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    skill_match_score: float
    eligibility_status: str
    eligibility_reason: Optional[Union[str, List[str]]] = None
    assessed_at: datetime


# --- Notification Schemas ---


class NotificationCreate(BaseModel):
    student_id: str
    title: str = Field(min_length=1)
    message: str = Field(min_length=1)


class NotificationResponse(BaseModel):
    id: str
    student_id: str
    title: str
    message: str
    is_read: bool
    created_at: datetime


# --- Audit Log Schemas ---


class AuditLogResponse(BaseModel):
    id: str
    user_id: str
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    entity_type: str
    entity_id: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
