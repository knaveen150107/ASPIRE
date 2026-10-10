"""MongoDB Index definitions for ASPIRE collections."""

from typing import Dict, List
from pymongo import ASCENDING, DESCENDING, IndexModel

COLLECTION_INDEXES: Dict[str, List[IndexModel]] = {
    "users": [
        IndexModel([("email", ASCENDING)], unique=True, name="idx_users_email_unique"),
        IndexModel([("role", ASCENDING), ("is_active", ASCENDING)], name="idx_users_role_active"),
    ],
    "student_profiles": [
        IndexModel([("user_id", ASCENDING)], unique=True, name="idx_student_profiles_user_id_unique"),
        IndexModel([("register_number", ASCENDING)], unique=True, name="idx_student_profiles_reg_no_unique"),
        IndexModel(
            [("department", ASCENDING), ("degree", ASCENDING), ("graduation_year", ASCENDING)],
            name="idx_student_profiles_academic_filter",
        ),
        IndexModel([("cgpa", ASCENDING)], name="idx_student_profiles_cgpa"),
    ],
    "recruiter_profiles": [
        IndexModel([("user_id", ASCENDING)], unique=True, name="idx_recruiter_profiles_user_id_unique"),
        IndexModel([("organization_email", ASCENDING)], name="idx_recruiter_profiles_org_email"),
        IndexModel([("verified", ASCENDING)], name="idx_recruiter_profiles_verified"),
    ],
    "admin_profiles": [
        IndexModel([("user_id", ASCENDING)], unique=True, name="idx_admin_profiles_user_id_unique"),
    ],
    "companies": [
        IndexModel([("name", ASCENDING)], name="idx_companies_name"),
        IndexModel([("recruiter_id", ASCENDING)], name="idx_companies_recruiter_id"),
        IndexModel([("industry", ASCENDING)], name="idx_companies_industry"),
    ],
    "jobs": [
        IndexModel([("company_id", ASCENDING)], name="idx_jobs_company_id"),
        IndexModel([("status", ASCENDING), ("deadline", ASCENDING)], name="idx_jobs_status_deadline"),
        IndexModel([("eligible_departments", ASCENDING), ("status", ASCENDING)], name="idx_jobs_dept_status"),
        IndexModel([("graduation_years", ASCENDING), ("status", ASCENDING)], name="idx_jobs_grad_years_status"),
        IndexModel([("min_cgpa", ASCENDING)], name="idx_jobs_min_cgpa"),
        IndexModel([("created_at", DESCENDING)], name="idx_jobs_created_at_desc"),
    ],
    "skills": [
        IndexModel([("name", ASCENDING)], unique=True, name="idx_skills_name_unique"),
        IndexModel([("category", ASCENDING)], name="idx_skills_category"),
    ],
    "student_skills": [
        IndexModel(
            [("student_id", ASCENDING), ("skill_id", ASCENDING)],
            unique=True,
            name="idx_student_skills_unique_pair",
        ),
        IndexModel([("student_id", ASCENDING)], name="idx_student_skills_student_id"),
        IndexModel([("skill_id", ASCENDING)], name="idx_student_skills_skill_id"),
    ],
    "job_requirements": [
        IndexModel(
            [("job_id", ASCENDING), ("skill_id", ASCENDING)],
            unique=True,
            name="idx_job_requirements_unique_pair",
        ),
        IndexModel([("job_id", ASCENDING), ("mandatory", ASCENDING)], name="idx_job_requirements_mandatory"),
        IndexModel([("skill_id", ASCENDING)], name="idx_job_requirements_skill_id"),
    ],
    "applications": [
        IndexModel(
            [("student_id", ASCENDING), ("job_id", ASCENDING)],
            unique=True,
            name="idx_applications_student_job_unique",
        ),
        IndexModel([("student_id", ASCENDING), ("status", ASCENDING)], name="idx_applications_student_status"),
        IndexModel([("job_id", ASCENDING), ("status", ASCENDING)], name="idx_applications_job_status"),
        IndexModel([("applied_at", DESCENDING)], name="idx_applications_applied_at_desc"),
    ],
    "mock_tests": [
        IndexModel(
            [("student_id", ASCENDING), ("created_at", DESCENDING)],
            name="idx_mock_tests_student_created",
        ),
        IndexModel([("job_id", ASCENDING)], name="idx_mock_tests_job_id"),
        IndexModel([("status", ASCENDING)], name="idx_mock_tests_status"),
    ],
    "test_questions": [
        IndexModel([("mock_test_id", ASCENDING)], name="idx_test_questions_mock_test_id"),
        IndexModel([("skill_id", ASCENDING)], name="idx_test_questions_skill_id"),
    ],
    "test_results": [
        IndexModel([("mock_test_id", ASCENDING)], unique=True, name="idx_test_results_mock_test_unique"),
        IndexModel(
            [("student_id", ASCENDING), ("evaluated_at", DESCENDING)],
            name="idx_test_results_student_evaluated",
        ),
    ],
    "question_responses": [
        IndexModel(
            [("result_id", ASCENDING), ("question_id", ASCENDING)],
            unique=True,
            name="idx_question_responses_unique_pair",
        ),
        IndexModel([("result_id", ASCENDING)], name="idx_question_responses_result_id"),
    ],
    "skill_gap_reports": [
        IndexModel(
            [("student_id", ASCENDING), ("job_id", ASCENDING)],
            name="idx_skill_gap_reports_student_job",
        ),
        IndexModel(
            [("student_id", ASCENDING), ("generated_at", DESCENDING)],
            name="idx_skill_gap_reports_student_generated",
        ),
    ],
    "skill_gaps": [
        IndexModel(
            [("report_id", ASCENDING), ("skill_id", ASCENDING)],
            unique=True,
            name="idx_skill_gaps_report_skill_unique",
        ),
        IndexModel([("report_id", ASCENDING), ("priority", ASCENDING)], name="idx_skill_gaps_report_priority"),
    ],
    "roadmaps": [
        IndexModel(
            [("student_id", ASCENDING), ("created_at", DESCENDING)],
            name="idx_roadmaps_student_created",
        ),
        IndexModel([("report_id", ASCENDING)], name="idx_roadmaps_report_id"),
        IndexModel([("status", ASCENDING)], name="idx_roadmaps_status"),
    ],
    "roadmap_steps": [
        IndexModel(
            [("roadmap_id", ASCENDING), ("sequence_number", ASCENDING)],
            unique=True,
            name="idx_roadmap_steps_sequence_unique",
        ),
        IndexModel([("roadmap_id", ASCENDING), ("status", ASCENDING)], name="idx_roadmap_steps_status"),
    ],
    "resumes": [
        IndexModel(
            [("student_id", ASCENDING), ("created_at", DESCENDING)],
            name="idx_resumes_student_created",
        ),
    ],
    "resume_versions": [
        IndexModel(
            [("resume_id", ASCENDING), ("version_number", ASCENDING)],
            unique=True,
            name="idx_resume_versions_version_unique",
        ),
        IndexModel(
            [("resume_id", ASCENDING), ("job_id", ASCENDING)],
            name="idx_resume_versions_resume_job",
        ),
    ],
    "performance_records": [
        IndexModel(
            [("student_id", ASCENDING), ("job_id", ASCENDING)],
            name="idx_performance_records_student_job",
        ),
        IndexModel(
            [("student_id", ASCENDING), ("assessed_at", DESCENDING)],
            name="idx_performance_records_student_assessed",
        ),
    ],
    "notifications": [
        IndexModel(
            [("student_id", ASCENDING), ("is_read", ASCENDING), ("created_at", DESCENDING)],
            name="idx_notifications_student_unread_created",
        ),
    ],
    "audit_logs": [
        IndexModel(
            [("user_id", ASCENDING), ("created_at", DESCENDING)],
            name="idx_audit_logs_user_created",
        ),
        IndexModel(
            [("entity_type", ASCENDING), ("entity_id", ASCENDING)],
            name="idx_audit_logs_entity",
        ),
    ],
}
