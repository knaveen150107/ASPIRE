"""Pydantic document models and data definitions for ASPIRE collections."""

from datetime import datetime
from enum import Enum
from typing import Annotated, Any, Dict, List, Optional, Union
from bson import ObjectId
from pydantic import BaseModel, BeforeValidator, ConfigDict, Field

# Custom Pydantic ObjectId validator for Python / FastAPI compatibility
PyObjectId = Annotated[
    Union[ObjectId, str],
    BeforeValidator(lambda v: ObjectId(v) if isinstance(v, str) and ObjectId.is_valid(v) else v),
]


class MongoBaseModel(BaseModel):
    """Base model with MongoDB ObjectId serialization configuration."""

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )


# --- Enums ---


class UserRole(str, Enum):
    STUDENT = "student"
    RECRUITER = "recruiter"
    ADMIN = "admin"


class EmploymentType(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    INTERNSHIP = "internship"
    CONTRACT = "contract"


class JobStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"
    ARCHIVED = "archived"


class SkillProficiency(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class RequirementImportance(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ApplicationStatus(str, Enum):
    APPLIED = "applied"
    IN_REVIEW = "in_review"
    SHORTLISTED = "shortlisted"
    ASSESSMENT_SCHEDULED = "assessment_scheduled"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    OFFERED = "offered"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    MIXED = "mixed"


class MockTestStatus(str, Enum):
    CREATED = "created"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class QuestionType(str, Enum):
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"
    CODING = "coding"
    SHORT_ANSWER = "short_answer"


class RoadmapStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    PAUSED = "paused"


class StepStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class ResumeFileType(str, Enum):
    PDF = "pdf"
    DOCX = "docx"
    JSON = "json"


class EligibilityStatus(str, Enum):
    ELIGIBLE = "eligible"
    INELIGIBLE = "ineligible"
    PARTIALLY_ELIGIBLE = "partially_eligible"
    UNKNOWN = "unknown"


# --- Collection Document Schemas ---


class UserDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str
    email: str
    password_hash: str
    role: UserRole
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class StudentProfileDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: PyObjectId
    register_number: str
    department: str
    degree: str
    graduation_year: int
    cgpa: float = Field(ge=0.0, le=10.0)
    profile_summary: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class RecruiterProfileDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: PyObjectId
    designation: str
    organization_email: str
    verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AdminProfileDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: PyObjectId
    permissions: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CompanyDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str
    website: Optional[str] = None
    industry: str
    description: str
    recruiter_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class JobDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    company_id: PyObjectId
    title: str
    description: str
    location: str
    employment_type: EmploymentType
    min_cgpa: Optional[float] = Field(default=None, ge=0.0, le=10.0)
    eligible_departments: List[str]
    eligible_degrees: List[str]
    graduation_years: List[int]
    required_skills: List[Union[str, PyObjectId]] = Field(default_factory=list)
    preferred_skills: List[Union[str, PyObjectId]] = Field(default_factory=list)
    package_details: Optional[Union[Dict[str, Any], str]] = None
    application_url: Optional[str] = None
    deadline: Optional[datetime] = None
    status: JobStatus = JobStatus.DRAFT
    source_name: str
    source_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SkillDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str
    category: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class StudentSkillDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    student_id: PyObjectId
    skill_id: PyObjectId
    proficiency: SkillProficiency
    evidence: Optional[Union[Dict[str, Any], str]] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class JobRequirementDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    job_id: PyObjectId
    skill_id: PyObjectId
    importance: RequirementImportance
    mandatory: bool = True
    minimum_proficiency: SkillProficiency = SkillProficiency.BEGINNER
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ApplicationDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    student_id: PyObjectId
    job_id: PyObjectId
    resume_id: Optional[PyObjectId] = None
    applied_at: datetime = Field(default_factory=datetime.utcnow)
    status: ApplicationStatus = ApplicationStatus.APPLIED
    source: str
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class MockTestDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    student_id: PyObjectId
    job_id: Optional[PyObjectId] = None
    title: str
    difficulty: DifficultyLevel = DifficultyLevel.INTERMEDIATE
    status: MockTestStatus = MockTestStatus.CREATED
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class QuestionOption(MongoBaseModel):
    id: str
    text: str


class TestQuestionDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    mock_test_id: PyObjectId
    skill_id: PyObjectId
    question_text: str
    question_type: QuestionType
    options: Optional[List[QuestionOption]] = None
    correct_answer: Optional[Union[str, List[str], Dict[str, Any]]] = None
    explanation: Optional[str] = None
    marks: float = 1.0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TopicScore(MongoBaseModel):
    skill_id: PyObjectId
    skill_name: Optional[str] = None
    score: float
    total_marks: float
    percentage: Optional[float] = None


class TestResultDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    mock_test_id: PyObjectId
    student_id: PyObjectId
    score: float
    percentage: float = Field(ge=0.0, le=100.0)
    correct_count: int = Field(ge=0)
    total_questions: int = Field(ge=0)
    topic_scores: List[TopicScore] = Field(default_factory=list)
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)


class QuestionResponseDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    result_id: PyObjectId
    question_id: PyObjectId
    answer: Optional[Union[str, List[str], Dict[str, Any]]] = None
    is_correct: bool
    marks_awarded: float = 0.0
    submitted_at: datetime = Field(default_factory=datetime.utcnow)


class SkillGapReportDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    student_id: PyObjectId
    job_id: PyObjectId
    readiness_score: float = Field(ge=0.0, le=100.0)
    summary: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class SkillGapDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    report_id: PyObjectId
    skill_id: PyObjectId
    current_level: str
    target_level: str
    priority: RequirementImportance
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RoadmapDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    student_id: PyObjectId
    report_id: Optional[PyObjectId] = None
    title: str
    target_date: Optional[datetime] = None
    status: RoadmapStatus = RoadmapStatus.NOT_STARTED
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class RoadmapStepDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    roadmap_id: PyObjectId
    skill_id: PyObjectId
    title: str
    description: str
    resource_url: Optional[str] = None
    sequence_number: int = Field(ge=1)
    status: StepStatus = StepStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ResumeDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    student_id: PyObjectId
    title: str
    file_url: str
    file_type: ResumeFileType = ResumeFileType.PDF
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ResumeVersionDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    resume_id: PyObjectId
    job_id: Optional[PyObjectId] = None
    content: Dict[str, Any]
    file_url: Optional[str] = None
    version_number: int = Field(ge=1)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PerformanceRecordDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    student_id: PyObjectId
    job_id: PyObjectId
    skill_match_score: float = Field(ge=0.0, le=100.0)
    eligibility_status: EligibilityStatus
    eligibility_reason: Optional[Union[str, List[str]]] = None
    assessed_at: datetime = Field(default_factory=datetime.utcnow)


class NotificationDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    student_id: PyObjectId
    title: str
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AuditLogDocument(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: PyObjectId
    action: str
    entity_type: str
    entity_id: Union[PyObjectId, str]
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
