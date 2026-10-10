"""ASPIRE API v1 Router Aggregator."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    applications,
    audit,
    auth,
    companies,
    jobs,
    mock_tests,
    notifications,
    performance,
    recruiters,
    resumes,
    roadmaps,
    skill_gaps,
    skills,
    students,
    users,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Access"])
api_router.include_router(users.router, prefix="/users", tags=["User Administration"])
api_router.include_router(students.router, prefix="/students", tags=["Student Profiles & Skills"])
api_router.include_router(recruiters.router, prefix="/recruiters", tags=["Recruiter Profiles"])
api_router.include_router(companies.router, prefix="/companies", tags=["Companies & Employers"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Job Opportunities & Eligibility"])
api_router.include_router(skills.router, prefix="/skills", tags=["Skills Master Ontology"])
api_router.include_router(applications.router, prefix="/applications", tags=["Placement Applications"])
api_router.include_router(mock_tests.router, prefix="/mock-tests", tags=["Mock Assessments & Results"])
api_router.include_router(skill_gaps.router, prefix="/skill-gaps", tags=["Skill Gap Analysis"])
api_router.include_router(roadmaps.router, prefix="/roadmaps", tags=["Learning Roadmaps"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["Resumes & Tailored Versions"])
api_router.include_router(performance.router, prefix="/performance", tags=["Performance & Fit Records"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(audit.router, prefix="/audit", tags=["Security & Audit Logs"])
