"""MongoDB $jsonSchema validation definitions for all ASPIRE collections."""

from typing import Any, Dict

COLLECTION_VALIDATORS: Dict[str, Dict[str, Any]] = {
    "users": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["name", "email", "password_hash", "role", "is_active", "created_at", "updated_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "name": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Full name of the user",
                },
                "email": {
                    "bsonType": "string",
                    "pattern": r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
                    "description": "Unique email address for user login",
                },
                "password_hash": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Secure hashed password string",
                },
                "role": {
                    "bsonType": "string",
                    "enum": ["student", "recruiter", "admin"],
                    "description": "System access role",
                },
                "is_active": {
                    "bsonType": "bool",
                    "description": "Flag indicating whether user account is active",
                },
                "created_at": {"bsonType": "date"},
                "updated_at": {"bsonType": "date"},
            },
        }
    },
    "student_profiles": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": [
                "user_id",
                "register_number",
                "department",
                "degree",
                "graduation_year",
                "cgpa",
                "created_at",
                "updated_at",
            ],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "user_id": {
                    "bsonType": "objectId",
                    "description": "Reference to users._id",
                },
                "register_number": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Institutional student registration number",
                },
                "department": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Academic department (e.g., Computer Science)",
                },
                "degree": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Degree program (e.g., B.Tech, M.Tech)",
                },
                "graduation_year": {
                    "bsonType": "int",
                    "minimum": 1990,
                    "maximum": 2100,
                    "description": "Expected or actual year of graduation",
                },
                "cgpa": {
                    "bsonType": ["double", "int"],
                    "minimum": 0.0,
                    "maximum": 10.0,
                    "description": "Cumulative Grade Point Average on a 10-point scale",
                },
                "profile_summary": {
                    "bsonType": ["string", "null"],
                    "description": "Brief bio or summary of the student",
                },
                "phone": {"bsonType": ["string", "null"]},
                "college": {"bsonType": ["string", "null"]},
                "current_year": {"bsonType": ["int", "null"]},
                "current_semester": {"bsonType": ["int", "null"]},
                "active_backlogs": {"bsonType": ["int", "null"]},
                "profession": {"bsonType": ["string", "null"]},
                "headline": {"bsonType": ["string", "null"]},
                "location": {"bsonType": ["string", "null"]},
                "avatar_url": {"bsonType": ["string", "null"]},
                "resume_url": {"bsonType": ["string", "null"]},
                "resume_filename": {"bsonType": ["string", "null"]},
                "resume_updated_at": {"bsonType": ["date", "null"]},
                "social_links": {"bsonType": ["object", "null"]},
                "projects": {"bsonType": ["array", "null"]},
                "education": {"bsonType": ["array", "null"]},
                "experience": {"bsonType": ["array", "null"]},
                "certifications": {"bsonType": ["array", "null"]},
                "achievements": {"bsonType": ["array", "null"]},
                "created_at": {"bsonType": "date"},
                "updated_at": {"bsonType": "date"},
            },
        }
    },
    "recruiter_profiles": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": [
                "user_id",
                "designation",
                "organization_email",
                "verified",
                "created_at",
                "updated_at",
            ],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "user_id": {
                    "bsonType": "objectId",
                    "description": "Reference to users._id",
                },
                "designation": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Recruiter's corporate title/designation",
                },
                "organization_email": {
                    "bsonType": "string",
                    "pattern": r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
                    "description": "Official company email address",
                },
                "verified": {
                    "bsonType": "bool",
                    "description": "Verification flag for recruiter credentials",
                },
                "created_at": {"bsonType": "date"},
                "updated_at": {"bsonType": "date"},
            },
        }
    },
    "admin_profiles": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["user_id", "permissions", "created_at", "updated_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "user_id": {
                    "bsonType": "objectId",
                    "description": "Reference to users._id",
                },
                "permissions": {
                    "bsonType": "array",
                    "items": {"bsonType": "string"},
                    "description": "List of explicit administrative permission codes",
                },
                "created_at": {"bsonType": "date"},
                "updated_at": {"bsonType": "date"},
            },
        }
    },
    "companies": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["name", "industry", "description", "recruiter_id", "created_at", "updated_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "name": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Company legal or brand name",
                },
                "website": {
                    "bsonType": ["string", "null"],
                    "description": "Company corporate website URL",
                },
                "industry": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Primary industry sector",
                },
                "description": {
                    "bsonType": "string",
                    "description": "Company overview and profile",
                },
                "recruiter_id": {
                    "bsonType": "objectId",
                    "description": "Reference to responsible recruiter_profiles._id (or users._id)",
                },
                "created_at": {"bsonType": "date"},
                "updated_at": {"bsonType": "date"},
            },
        }
    },
    "jobs": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": [
                "company_id",
                "title",
                "description",
                "location",
                "employment_type",
                "eligible_departments",
                "eligible_degrees",
                "graduation_years",
                "status",
                "source_name",
                "created_at",
                "updated_at",
            ],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "company_id": {
                    "bsonType": "objectId",
                    "description": "Reference to companies._id",
                },
                "title": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Job title/role name",
                },
                "description": {
                    "bsonType": "string",
                    "description": "Full job description, role overview, and expectations",
                },
                "location": {
                    "bsonType": "string",
                    "description": "Job location or Remote/Hybrid indicator",
                },
                "employment_type": {
                    "bsonType": "string",
                    "enum": ["full_time", "part_time", "internship", "contract"],
                    "description": "Nature of employment",
                },
                "min_cgpa": {
                    "bsonType": ["double", "int", "null"],
                    "minimum": 0.0,
                    "maximum": 10.0,
                    "description": "Explicit minimum CGPA requirement (null if unspecified)",
                },
                "eligible_departments": {
                    "bsonType": "array",
                    "items": {"bsonType": "string"},
                    "description": "List of qualifying academic departments",
                },
                "eligible_degrees": {
                    "bsonType": "array",
                    "items": {"bsonType": "string"},
                    "description": "List of qualifying degrees",
                },
                "graduation_years": {
                    "bsonType": "array",
                    "items": {"bsonType": "int"},
                    "description": "Eligible passing-out graduation years",
                },
                "required_skills": {
                    "bsonType": "array",
                    "items": {"bsonType": ["string", "objectId"]},
                    "description": "Array of skill names or skill IDs explicitly required",
                },
                "preferred_skills": {
                    "bsonType": "array",
                    "items": {"bsonType": ["string", "objectId"]},
                    "description": "Array of skill names or skill IDs preferred/good-to-have",
                },
                "package_details": {
                    "bsonType": ["object", "string", "null"],
                    "description": "Compensation structure (CTC, stipend, currency)",
                },
                "application_url": {
                    "bsonType": ["string", "null"],
                    "description": "External or portal direct application link",
                },
                "deadline": {
                    "bsonType": ["date", "null"],
                    "description": "Application cutoff timestamp",
                },
                "status": {
                    "bsonType": "string",
                    "enum": ["draft", "published", "closed", "archived"],
                    "description": "Publication lifecycle status",
                },
                "source_name": {
                    "bsonType": "string",
                    "description": "Source origin (e.g., Campus Placement, Career Page, LinkedIn)",
                },
                "source_url": {
                    "bsonType": ["string", "null"],
                    "description": "Original source listing URL",
                },
                "created_at": {"bsonType": "date"},
                "updated_at": {"bsonType": "date"},
            },
        }
    },
    "skills": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["name", "category", "created_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "name": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Canonical skill name (unique)",
                },
                "category": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Classification category (e.g. Programming, Database, Soft Skills)",
                },
                "description": {
                    "bsonType": ["string", "null"],
                    "description": "Detailed explanation of the skill domain",
                },
                "created_at": {"bsonType": "date"},
            },
        }
    },
    "student_skills": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["student_id", "skill_id", "proficiency", "updated_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "student_id": {
                    "bsonType": "objectId",
                    "description": "Reference to student_profiles._id",
                },
                "skill_id": {
                    "bsonType": "objectId",
                    "description": "Reference to skills._id",
                },
                "proficiency": {
                    "bsonType": "string",
                    "enum": ["beginner", "intermediate", "advanced", "expert"],
                    "description": "Demonstrated competency level",
                },
                "evidence": {
                    "bsonType": ["object", "string", "null"],
                    "description": "Supporting evidence (projects, certifications, mock assessment scores)",
                },
                "updated_at": {"bsonType": "date"},
            },
        }
    },
    "job_requirements": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["job_id", "skill_id", "importance", "mandatory", "minimum_proficiency", "created_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "job_id": {
                    "bsonType": "objectId",
                    "description": "Reference to jobs._id",
                },
                "skill_id": {
                    "bsonType": "objectId",
                    "description": "Reference to skills._id",
                },
                "importance": {
                    "bsonType": "string",
                    "enum": ["critical", "high", "medium", "low"],
                    "description": "Role importance priority weighting",
                },
                "mandatory": {
                    "bsonType": "bool",
                    "description": "Whether the skill is a strict prerequisite for eligibility",
                },
                "minimum_proficiency": {
                    "bsonType": "string",
                    "enum": ["beginner", "intermediate", "advanced", "expert"],
                    "description": "Minimum required proficiency level",
                },
                "created_at": {"bsonType": "date"},
            },
        }
    },
    "applications": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["student_id", "job_id", "applied_at", "status", "source", "created_at", "updated_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "student_id": {
                    "bsonType": "objectId",
                    "description": "Reference to student_profiles._id",
                },
                "job_id": {
                    "bsonType": "objectId",
                    "description": "Reference to jobs._id",
                },
                "resume_id": {
                    "bsonType": ["objectId", "null"],
                    "description": "Optional reference to resumes._id or resume_versions._id used",
                },
                "applied_at": {"bsonType": "date"},
                "status": {
                    "bsonType": "string",
                    "enum": [
                        "applied",
                        "in_review",
                        "shortlisted",
                        "assessment_scheduled",
                        "interview_scheduled",
                        "offered",
                        "rejected",
                        "withdrawn",
                    ],
                    "description": "Current lifecycle status of application",
                },
                "source": {
                    "bsonType": "string",
                    "description": "Channel of application submission",
                },
                "notes": {
                    "bsonType": ["string", "null"],
                    "description": "Internal recruiter/student tracking notes",
                },
                "created_at": {"bsonType": "date"},
                "updated_at": {"bsonType": "date"},
            },
        }
    },
    "mock_tests": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["student_id", "title", "difficulty", "status", "created_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "student_id": {
                    "bsonType": "objectId",
                    "description": "Reference to student_profiles._id",
                },
                "job_id": {
                    "bsonType": ["objectId", "null"],
                    "description": "Optional target role reference to jobs._id",
                },
                "title": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Descriptive assessment title",
                },
                "difficulty": {
                    "bsonType": "string",
                    "enum": ["beginner", "intermediate", "advanced", "mixed"],
                    "description": "Target test difficulty profile",
                },
                "status": {
                    "bsonType": "string",
                    "enum": ["created", "in_progress", "completed", "abandoned"],
                    "description": "Assessment session progress status",
                },
                "started_at": {"bsonType": ["date", "null"]},
                "completed_at": {"bsonType": ["date", "null"]},
                "created_at": {"bsonType": "date"},
            },
        }
    },
    "test_questions": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["mock_test_id", "skill_id", "question_text", "question_type", "marks", "created_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "mock_test_id": {
                    "bsonType": "objectId",
                    "description": "Reference to mock_tests._id",
                },
                "skill_id": {
                    "bsonType": "objectId",
                    "description": "Reference to skills._id",
                },
                "question_text": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Full problem/question statement",
                },
                "question_type": {
                    "bsonType": "string",
                    "enum": ["single_choice", "multiple_choice", "coding", "short_answer"],
                    "description": "Format of question and response",
                },
                "options": {
                    "bsonType": ["array", "null"],
                    "items": {
                        "bsonType": "object",
                        "required": ["id", "text"],
                        "properties": {
                            "id": {"bsonType": "string"},
                            "text": {"bsonType": "string"},
                        },
                    },
                    "description": "Option choices for choice-based questions",
                },
                "correct_answer": {
                    "bsonType": ["string", "array", "object", "null"],
                    "description": "Securely stored answer key (must not be leaked to client before evaluation)",
                },
                "explanation": {
                    "bsonType": ["string", "null"],
                    "description": "Detailed post-evaluation solution and explanation",
                },
                "marks": {
                    "bsonType": ["int", "double"],
                    "minimum": 0,
                    "description": "Maximum marks awarded for correct solution",
                },
                "created_at": {"bsonType": "date"},
            },
        }
    },
    "test_results": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": [
                "mock_test_id",
                "student_id",
                "score",
                "percentage",
                "correct_count",
                "total_questions",
                "topic_scores",
                "evaluated_at",
            ],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "mock_test_id": {
                    "bsonType": "objectId",
                    "description": "Reference to mock_tests._id",
                },
                "student_id": {
                    "bsonType": "objectId",
                    "description": "Reference to student_profiles._id",
                },
                "score": {
                    "bsonType": ["int", "double"],
                    "minimum": 0,
                    "description": "Total marks scored by student",
                },
                "percentage": {
                    "bsonType": ["int", "double"],
                    "minimum": 0.0,
                    "maximum": 100.0,
                    "description": "Overall score percentage (0-100)",
                },
                "correct_count": {
                    "bsonType": "int",
                    "minimum": 0,
                    "description": "Number of questions answered correctly",
                },
                "total_questions": {
                    "bsonType": "int",
                    "minimum": 0,
                    "description": "Total number of evaluated questions",
                },
                "topic_scores": {
                    "bsonType": "array",
                    "items": {
                        "bsonType": "object",
                        "required": ["skill_id", "score", "total_marks"],
                        "properties": {
                            "skill_id": {"bsonType": "objectId"},
                            "skill_name": {"bsonType": ["string", "null"]},
                            "score": {"bsonType": ["int", "double"]},
                            "total_marks": {"bsonType": ["int", "double"]},
                            "percentage": {"bsonType": ["int", "double"]},
                        },
                    },
                    "description": "Granular breakdown of scores by skill/topic",
                },
                "evaluated_at": {"bsonType": "date"},
            },
        }
    },
    "question_responses": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["result_id", "question_id", "is_correct", "marks_awarded", "submitted_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "result_id": {
                    "bsonType": "objectId",
                    "description": "Reference to test_results._id",
                },
                "question_id": {
                    "bsonType": "objectId",
                    "description": "Reference to test_questions._id",
                },
                "answer": {
                    "bsonType": ["string", "array", "object", "null"],
                    "description": "Candidate's submitted response or code",
                },
                "is_correct": {
                    "bsonType": "bool",
                    "description": "Grading evaluation verdict",
                },
                "marks_awarded": {
                    "bsonType": ["int", "double"],
                    "minimum": 0,
                    "description": "Marks earned for this individual response",
                },
                "submitted_at": {"bsonType": "date"},
            },
        }
    },
    "skill_gap_reports": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["student_id", "job_id", "readiness_score", "summary", "generated_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "student_id": {
                    "bsonType": "objectId",
                    "description": "Reference to student_profiles._id",
                },
                "job_id": {
                    "bsonType": "objectId",
                    "description": "Reference to target jobs._id",
                },
                "readiness_score": {
                    "bsonType": ["int", "double"],
                    "minimum": 0.0,
                    "maximum": 100.0,
                    "description": "Overall placement readiness score percentage",
                },
                "summary": {
                    "bsonType": "string",
                    "description": "Executive summary of missing skills and strengths",
                },
                "generated_at": {"bsonType": "date"},
            },
        }
    },
    "skill_gaps": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["report_id", "skill_id", "current_level", "target_level", "priority", "created_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "report_id": {
                    "bsonType": "objectId",
                    "description": "Reference to skill_gap_reports._id",
                },
                "skill_id": {
                    "bsonType": "objectId",
                    "description": "Reference to skills._id",
                },
                "current_level": {
                    "bsonType": "string",
                    "enum": ["none", "beginner", "intermediate", "advanced"],
                    "description": "Student's current assessed proficiency",
                },
                "target_level": {
                    "bsonType": "string",
                    "enum": ["beginner", "intermediate", "advanced", "expert"],
                    "description": "Required proficiency for the role",
                },
                "priority": {
                    "bsonType": "string",
                    "enum": ["critical", "high", "medium", "low"],
                    "description": "Priority order for upskilling",
                },
                "created_at": {"bsonType": "date"},
            },
        }
    },
    "roadmaps": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["student_id", "title", "status", "created_at", "updated_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "student_id": {
                    "bsonType": "objectId",
                    "description": "Reference to student_profiles._id",
                },
                "report_id": {
                    "bsonType": ["objectId", "null"],
                    "description": "Optional reference to source skill_gap_reports._id",
                },
                "title": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Career milestone or learning plan title",
                },
                "target_date": {
                    "bsonType": ["date", "null"],
                    "description": "Target completion date",
                },
                "status": {
                    "bsonType": "string",
                    "enum": ["not_started", "in_progress", "completed", "paused"],
                    "description": "Progress state of learning roadmap",
                },
                "created_at": {"bsonType": "date"},
                "updated_at": {"bsonType": "date"},
            },
        }
    },
    "roadmap_steps": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": [
                "roadmap_id",
                "skill_id",
                "title",
                "description",
                "sequence_number",
                "status",
                "created_at",
                "updated_at",
            ],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "roadmap_id": {
                    "bsonType": "objectId",
                    "description": "Reference to roadmaps._id",
                },
                "skill_id": {
                    "bsonType": "objectId",
                    "description": "Reference to skills._id",
                },
                "title": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Step title / milestone action",
                },
                "description": {
                    "bsonType": "string",
                    "description": "Detailed learning curriculum or instructions",
                },
                "resource_url": {
                    "bsonType": ["string", "null"],
                    "description": "Recommended course, article, or documentation link",
                },
                "sequence_number": {
                    "bsonType": "int",
                    "minimum": 1,
                    "description": "1-based order in roadmap execution sequence",
                },
                "status": {
                    "bsonType": "string",
                    "enum": ["pending", "in_progress", "completed", "skipped"],
                    "description": "Status of the individual roadmap step",
                },
                "created_at": {"bsonType": "date"},
                "updated_at": {"bsonType": "date"},
            },
        }
    },
    "resumes": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["student_id", "title", "file_url", "file_type", "created_at", "updated_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "student_id": {
                    "bsonType": "objectId",
                    "description": "Reference to student_profiles._id",
                },
                "title": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Master resume label (e.g. FullStack Resume 2026)",
                },
                "file_url": {
                    "bsonType": "string",
                    "description": "Storage URL or bucket path of master resume document",
                },
                "file_type": {
                    "bsonType": "string",
                    "enum": ["pdf", "docx", "json"],
                    "description": "Format of master resume artifact",
                },
                "created_at": {"bsonType": "date"},
                "updated_at": {"bsonType": "date"},
            },
        }
    },
    "resume_versions": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["resume_id", "content", "version_number", "created_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "resume_id": {
                    "bsonType": "objectId",
                    "description": "Reference to parent resumes._id",
                },
                "job_id": {
                    "bsonType": ["objectId", "null"],
                    "description": "Optional tailored target reference to jobs._id",
                },
                "content": {
                    "bsonType": "object",
                    "description": "Structured JSON representation of the tailored resume sections",
                },
                "file_url": {
                    "bsonType": ["string", "null"],
                    "description": "Rendered PDF / docx download URL for this version",
                },
                "version_number": {
                    "bsonType": "int",
                    "minimum": 1,
                    "description": "Sequential revision number",
                },
                "created_at": {"bsonType": "date"},
            },
        }
    },
    "performance_records": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["student_id", "job_id", "skill_match_score", "eligibility_status", "assessed_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "student_id": {
                    "bsonType": "objectId",
                    "description": "Reference to student_profiles._id",
                },
                "job_id": {
                    "bsonType": "objectId",
                    "description": "Reference to jobs._id",
                },
                "skill_match_score": {
                    "bsonType": ["int", "double"],
                    "minimum": 0.0,
                    "maximum": 100.0,
                    "description": "Mathematical score of student skills matching job requirements (0-100)",
                },
                "eligibility_status": {
                    "bsonType": "string",
                    "enum": ["eligible", "ineligible", "partially_eligible", "unknown"],
                    "description": "Strict criteria eligibility (CGPA, degree, branch). Kept strictly separate from skill match.",
                },
                "eligibility_reason": {
                    "bsonType": ["string", "array", "null"],
                    "description": "Detailed breakdown explaining eligibility outcome",
                },
                "assessed_at": {"bsonType": "date"},
            },
        }
    },
    "notifications": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["student_id", "title", "message", "is_read", "created_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "student_id": {
                    "bsonType": "objectId",
                    "description": "Reference to student_profiles._id",
                },
                "title": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Short notification headline",
                },
                "message": {
                    "bsonType": "string",
                    "description": "Notification content body",
                },
                "is_read": {
                    "bsonType": "bool",
                    "description": "Read / unread status flag",
                },
                "created_at": {"bsonType": "date"},
            },
        }
    },
    "audit_logs": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["user_id", "action", "entity_type", "entity_id", "created_at"],
            "properties": {
                "_id": {"bsonType": "objectId"},
                "user_id": {
                    "bsonType": "objectId",
                    "description": "Reference to users._id who triggered the event",
                },
                "action": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Audit action name (e.g. USER_LOGIN, JOB_APPLY, PROFILE_UPDATE)",
                },
                "entity_type": {
                    "bsonType": "string",
                    "minLength": 1,
                    "description": "Target entity collection name (e.g. applications, jobs, resumes)",
                },
                "entity_id": {
                    "bsonType": ["objectId", "string"],
                    "description": "Identifier of the modified entity",
                },
                "metadata": {
                    "bsonType": ["object", "null"],
                    "description": "Sanitized event context (never stores passwords, auth tokens, or secrets)",
                },
                "created_at": {"bsonType": "date"},
            },
        }
    },
}
