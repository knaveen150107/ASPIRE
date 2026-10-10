# ASPIRE — REST API Architecture & Endpoints Documentation

This document provides complete documentation for the **ASPIRE AI Placement & Career Intelligence Platform** FastAPI backend.

---

## 1. Running the FastAPI Server Locally

### Start Development Server
From the `backend/` directory:

```bash
# Using the backend virtual environment
.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Interactive Documentation URLs
- **Swagger UI (Interactive API Docs):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc (Specification Docs):** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON Schema:** [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 2. Authentication & Authorization

ASPIRE uses standard **OAuth2 Bearer JWT tokens**:
- Pass the token in the `Authorization` HTTP header:
  `Authorization: Bearer <your_jwt_token>`
- Token contains `sub` (User `_id`), `role` (`student`, `recruiter`, `admin`), and expiration timestamps.

---

## 3. Endpoints Directory by Functional Domain

### A. Authentication & User Access (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register a new user (`student`, `recruiter`, `admin`) and create profile shell. |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user with JSON credentials and receive JWT access token. |
| `POST` | `/api/v1/auth/token` | Public | OAuth2 standard form login endpoint for Swagger UI authorization. |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve profile details of currently logged-in user. |

---

### B. User Administration (`/api/v1/users`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users` | Admin | List all registered users with optional role filter. |
| `POST` | `/api/v1/users/recruiters` | Admin | Provision and create verified recruiter accounts directly with company linkage. |
| `PUT` | `/api/v1/users/{user_id}/status` | Admin | Activate or deactivate user accounts. |

---

### C. Student Profiles & Competencies (`/api/v1/students`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/students/me/profile` | Student | Retrieve student academic record (CGPA, department, degree, passing year). |
| `PUT` | `/api/v1/students/me/profile` | Student | Update student academic details and profile summary. |
| `GET` | `/api/v1/students/me/skills` | Student | List verified and self-reported skills for student. |
| `POST` | `/api/v1/students/me/skills` | Student | Add or update a student skill proficiency with evidence. |
| `DELETE` | `/api/v1/students/me/skills/{skill_id}` | Student | Remove a skill from student profile. |
| `GET` | `/api/v1/students/me/dashboard` | Student | Aggregate student placement readiness dashboard overview. |

---

### D. Recruiter Profiles (`/api/v1/recruiters`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/recruiters/me/profile` | Recruiter | Retrieve corporate recruiter profile. |
| `PUT` | `/api/v1/recruiters/me/profile` | Recruiter | Update recruiter designation and corporate contact email. |

---

### E. Companies & Employers (`/api/v1/companies`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/companies` | Public | Browse company directory with optional industry filter. |
| `GET` | `/api/v1/companies/{company_id}` | Public | Retrieve full company profile details. |
| `POST` | `/api/v1/companies` | Recruiter | Create a new company profile. |
| `PUT` | `/api/v1/companies/{company_id}` | Recruiter | Update company details (managing recruiter only). |

---

### F. Job Postings & Eligibility (`/api/v1/jobs`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/jobs` | Public | Paginated job search with department, degree, graduation year, CGPA, and status filters. |
| `GET` | `/api/v1/jobs/{job_id}` | Public | Detailed job description and required criteria. |
| `GET` | `/api/v1/jobs/{job_id}/eligibility` | Student | **Evaluates student eligibility** against explicit academic criteria (CGPA, degree, department, batch year). |
| `POST` | `/api/v1/jobs` | Recruiter | Publish a new job opening with eligibility rules. |
| `GET` | `/api/v1/jobs/{job_id}/requirements` | Public | List skill requirements mapped to a job. |
| `POST` | `/api/v1/jobs/{job_id}/requirements` | Recruiter | Add a skill requirement to a job. |

---

### G. Skills Master Ontology (`/api/v1/skills`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/skills` | Public | List canonical skills with optional category or name search. |
| `POST` | `/api/v1/skills` | Authenticated | Create a new skill definition. |

---

### H. Placement Applications (`/api/v1/applications`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/applications` | Student | Submit an application for a job (**with duplicate prevention**). |
| `GET` | `/api/v1/applications/me` | Student | List all job applications submitted by the student. |
| `GET` | `/api/v1/applications/job/{job_id}` | Recruiter | List applicants for a specific job listing. |
| `PUT` | `/api/v1/applications/{app_id}/status` | Recruiter | Update applicant status (`shortlisted`, `offered`, `rejected`, etc.). |

---

### I. Mock Assessments & Evaluation (`/api/v1/mock-tests`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/mock-tests` | Student | Generate/create a practice assessment session for a role or skill. |
| `GET` | `/api/v1/mock-tests/me` | Student | List student mock-test history. |
| `GET` | `/api/v1/mock-tests/{test_id}/questions` | Student | Fetch test questions with **correct answers securely hidden**. |
| `POST` | `/api/v1/mock-tests/{test_id}/submit` | Student | Submit answers, evaluate against answer key, and generate result. |
| `GET` | `/api/v1/mock-tests/{test_id}/result` | Student | Retrieve scorecard with topic-wise performance breakdown. |

---

### J. Skill Gap Analysis (`/api/v1/skill-gaps`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/skill-gaps` | Student | Generate a skill-gap analysis report comparing student vs target job. |
| `GET` | `/api/v1/skill-gaps/me` | Student | List all past skill-gap reports for the student. |

---

### K. Learning Roadmaps (`/api/v1/roadmaps`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/roadmaps` | Student | Create a structured learning roadmap with sequenced milestones. |
| `GET` | `/api/v1/roadmaps/me` | Student | List active roadmaps for the student. |
| `PUT` | `/api/v1/roadmaps/steps/{step_id}` | Student | Update status of a roadmap step (`pending`, `in_progress`, `completed`, `skipped`). |

---

### L. Resumes & Tailored Versions (`/api/v1/resumes`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/resumes` | Student | Register a master resume document. |
| `GET` | `/api/v1/resumes/me` | Student | List master resumes uploaded by student. |
| `POST` | `/api/v1/resumes/{resume_id}/versions` | Student | Generate and store a job-specific tailored resume version. |
| `GET` | `/api/v1/resumes/{resume_id}/versions` | Student | View revision history for a master resume. |

---

### M. Performance Records (`/api/v1/performance`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/performance` | Student | Record an academic eligibility and skill-match evaluation. |
| `GET` | `/api/v1/performance/me` | Student | View performance evaluation history. |

---

### N. Notifications & System Auditing (`/api/v1/notifications`, `/api/v1/audit`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notifications/me` | Student | List placement updates and system notifications. |
| `PUT` | `/api/v1/notifications/{id}/read` | Student | Mark notification as read. |
| `GET` | `/api/v1/audit` | Admin | Review security audit trail and system actions. |
