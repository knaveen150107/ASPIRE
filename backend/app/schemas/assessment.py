"""Mock Test, Question, and Assessment Result Schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class QuestionOption(BaseModel):
    id: str
    text: str


class TestQuestionCreate(BaseModel):
    skill_id: str
    question_text: str
    question_type: str = Field(pattern="^(single_choice|multiple_choice|coding|short_answer)$")
    options: Optional[List[QuestionOption]] = None
    correct_answer: Union[str, List[str], Dict[str, Any]]
    explanation: Optional[str] = None
    marks: float = 1.0


class TestQuestionPublicResponse(BaseModel):
    id: str
    mock_test_id: str
    skill_id: str
    skill_name: Optional[str] = None
    question_text: str
    question_type: str
    options: Optional[List[QuestionOption]] = None
    marks: float
    # Note: correct_answer and explanation are deliberately omitted for test delivery


class MockTestCreate(BaseModel):
    job_id: Optional[str] = None
    title: str = Field(min_length=1)
    company_name: Optional[str] = None
    category: Optional[str] = "technical"
    difficulty: str = Field(pattern="^(beginner|intermediate|advanced|mixed|standard|medium|hard|easy)$", default="intermediate")
    total_questions: Optional[int] = 0
    score: Optional[float] = None
    percentage: Optional[float] = None
    correct_count: Optional[int] = None
    topic_scores: Optional[Union[Dict[str, Any], List[Dict[str, Any]]]] = None
    detailed_feedback: Optional[List[Dict[str, Any]]] = None
    ai_feedback: Optional[str] = None
    status: Optional[str] = "completed"
    questions: Optional[List[TestQuestionCreate]] = None


class MockTestResponse(BaseModel):
    id: str
    student_id: str
    job_id: Optional[str] = None
    title: str
    company_name: Optional[str] = None
    category: Optional[str] = "technical"
    difficulty: str = "intermediate"
    status: str = "completed"
    score: Optional[float] = None
    percentage: Optional[float] = None
    correct_count: Optional[int] = None
    total_questions: Optional[int] = 0
    topic_scores: Optional[Any] = None
    detailed_feedback: Optional[Any] = None
    ai_feedback: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    questions_count: Optional[int] = 0


class QuestionAnswerSubmission(BaseModel):
    question_id: str
    answer: Union[str, List[str], Dict[str, Any], None] = None


class TestSubmissionRequest(BaseModel):
    responses: List[QuestionAnswerSubmission]


class TopicScoreResponse(BaseModel):
    skill_id: str
    skill_name: Optional[str] = None
    score: float
    total_marks: float
    percentage: Optional[float] = None


class TestResultResponse(BaseModel):
    id: str
    mock_test_id: str
    student_id: str
    score: float
    percentage: float
    correct_count: int
    total_questions: int
    topic_scores: List[TopicScoreResponse]
    evaluated_at: datetime
