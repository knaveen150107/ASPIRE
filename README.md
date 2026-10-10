# ASPIRE
### AI-Powered Student Placement and Career Intelligence Platform

**Discover opportunities. Identify skill gaps. Prepare smarter. Aspire higher.**

ASPIRE is an intelligent, AI-powered career and placement preparation platform designed to bridge the gap between students and employment opportunities. It helps students discover relevant jobs, understand company requirements, practise role-specific assessments, identify missing skills, and build tailored resumes through a unified, personalized career development experience.

## Run with Docker

Install Docker Desktop, then from the repository root create your environment file and set a private JWT secret:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and replace `SECRET_KEY` with a long, random value. Start the application:

```powershell
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080). The API is available at [http://localhost:8000](http://localhost:8000), with interactive documentation at [http://localhost:8000/docs](http://localhost:8000/docs). Compose starts MongoDB locally and keeps its data in the `mongo-data` volume, and persists uploaded profile avatars and resume documents in the `uploads-data` volume. Set `MONGODB_URI` in `.env` if you want to use a MongoDB Atlas cluster instead.

Stop the containers with `Ctrl+C`, or run `docker compose down`. To also delete persisted storage (database & uploads), run `docker compose down --volumes`.

Our vision is simple: **Every student deserves a clear path toward career growth, even when they are not eligible for every campus placement opportunity.**

---

## The Problem We Want to Solve

Campus placement portals often focus on publishing job openings and filtering students according to company eligibility criteria, such as CGPA, degree, graduation year, and other requirements.

While these criteria may be necessary for recruitment, students who do not meet a particular requirement are often left wondering what to do next.

- Which companies and roles can I realistically target?
- What skills do employers expect from me?
- How can I prepare for a specific company's assessment?
- Which technical concepts am I weak in?
- How can I improve my resume for a particular job?
- What should I learn next to improve my placement readiness?

Students frequently depend on multiple disconnected platforms for job discovery, aptitude practice, technical assessments, resume creation, and career guidance.

ASPIRE aims to bring these activities together into one intelligent, student-centric platform.

## Our Motive

Our motive is not simply to create another job portal. We want to build a platform that helps students understand their current capabilities, discover suitable opportunities, and take measurable steps toward their career goals.

Instead of showing students only the opportunities they cannot apply for, ASPIRE aims to explain what they qualify for, what skills they need to strengthen, and how they can prepare for future opportunities.

We believe that academic eligibility and professional capability are different dimensions of a student's profile. While company eligibility rules must be respected, students should still have access to guidance, skill development, and alternative career opportunities.

**ASPIRE transforms placement preparation from a fragmented, reactive process into a personalized, continuous journey of improvement.**

---

## Our Proposed Solution

ASPIRE combines intelligent job discovery, eligibility analysis, AI-generated assessments, performance analytics, skill-gap identification, and resume optimization into a unified workflow.

### 1. Intelligent Job Discovery

Discover relevant job opportunities and internships from supported, authorized job sources and company career pages.

- Filter opportunities by CGPA, degree, graduation year, and published eligibility requirements.
- Rank jobs using skills, interests, preferred roles, location, and salary expectations.
- Display job descriptions, required skills, published compensation, deadlines, and official application links.
- Explain why a particular opportunity matches or does not match the student's profile.
- Help students discover alternative opportunities when they do not meet a specific company's requirements.

### 2. AI-Powered Company-Specific Mock Tests

Prepare for employment assessments based on the requirements of a selected job or role.

- Generate relevant practice questions from job descriptions and role requirements.
- Support aptitude, logical reasoning, programming, data structures and algorithms, SQL, and other relevant technical topics.
- Provide timed assessments and configurable difficulty levels.
- Evaluate answers and provide explanations for incorrect responses.
- Track assessment history to help students measure their progress.

Mock tests are intended for practice and preparation, not as a guarantee of reproducing a company's actual recruitment examination.

### 3. Performance Analysis and Skill-Gap Detection

Understanding weaknesses is essential for effective preparation.

ASPIRE aims to analyze assessment results and identify the areas that require improvement.

- Overall test scores and topic-wise accuracy.
- Time management and question-solving speed.
- Identification of weak technical and aptitude topics.
- Comparison between demonstrated skills and job requirements.
- Personalized recommendations for improvement.
- Progress tracking across repeated assessments.

The goal is to turn test results into actionable feedback rather than simply displaying a score.

### 4. AI-Assisted Resume Builder

Create resumes tailored to specific job descriptions while maintaining accuracy and authenticity.

- Identify relevant skills and keywords from a job description.
- Highlight suitable projects, certifications, and genuine experience.
- Improve resume structure, clarity, and professional wording.
- Identify important requirements that lack supporting evidence in the student's profile.
- Generate separate resume versions for different job roles.
- Export resumes for applications.

ASPIRE is designed to improve how students present their qualifications, not to fabricate achievements or misrepresent their experience.

### 5. Personalized Career Roadmap

Help students understand what they should work on next.

- Recommend learning resources based on identified skill gaps.
- Create structured preparation plans for target roles.
- Prioritize skills according to job requirements and assessment performance.
- Suggest practice tasks and follow-up assessments.
- Monitor progress and recommend areas for further improvement.

### 6. Placement Readiness Dashboard

Provide a unified overview of a student's career preparation.

- Recommended and eligible job opportunities.
- Upcoming application deadlines.
- Mock-test scores and assessment history.
- Skill-gap reports and improvement suggestions.
- Resume readiness and job-specific relevance.
- Personalized learning tasks.
- Saved jobs and application progress.

The dashboard is intended to help students make informed decisions and focus on their next best action.

---

## How ASPIRE Works

The proposed student journey follows a continuous improvement cycle:

1. **Create a Profile:** Enter academic details, skills, projects, interests, and career preferences.
2. **Discover Opportunities:** Find relevant jobs based on eligibility, skills, and preferences.
3. **Understand Requirements:** Review company criteria, required skills, and role expectations.
4. **Practise:** Take a mock test tailored to the selected role.
5. **Analyze:** Receive a performance report and identify skill gaps.
6. **Improve:** Follow a personalized preparation roadmap.
7. **Build a Resume:** Create a job-specific resume based on genuine qualifications.
8. **Apply and Track:** Visit the official application page and track preparation and application progress.

This cycle can be repeated as students develop their skills and explore new opportunities.

---

## AI Agent Architecture

ASPIRE is designed around specialized AI agents, coordinated through a career-orchestration workflow.

| Agent | Responsibility |
| --- | --- |
| Career Orchestrator Agent | Coordinates the student's workflow and delegates tasks. |
| Job Discovery Agent | Finds and organizes opportunities from supported sources. |
| Eligibility and Matching Agent | Checks published eligibility criteria and evaluates job relevance. |
| Mock Test Agent | Generates role-specific practice assessments. |
| Skill Gap Analysis Agent | Analyzes assessment results and identifies improvement areas. |
| Resume Agent | Tailors resumes to job requirements using verified student information. |
| Career Roadmap Agent | Recommends learning activities and preparation plans. |

These agents may share a common language model and supporting services. Eligibility checks, numerical scoring, and other rule-based operations should use validated application logic wherever possible.

---

## Technology Stack

The proposed technology stack includes:

| Component | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| UI and Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| AI and Language Models | LLM APIs and Python-based AI services |
| Agent Orchestration | LangGraph or a structured Python workflow |
| Semantic Search | Embeddings and vector search, where needed |
| Document Generation | PDF resume generation |
| Deployment | Docker and a suitable cloud platform |

The final stack may evolve during development as requirements and implementation constraints become clearer.

---

## Project Roadmap

### Phase 1 — Core Platform

- Student registration and profile management.
- Job discovery and eligibility filtering.
- Job details and matching explanations.
- Mock-test creation and evaluation.
- Performance reports and skill-gap analysis.
- Job-specific resume generation.

### Phase 2 — Personalized Career Intelligence

- Personalized learning roadmaps.
- Improved job recommendations.
- Assessment progress analytics.
- Job alerts and application tracking.
- Multiple resume versions for different roles.

### Phase 3 — Expanded Platform

- Additional supported job sources.
- More assessment categories and job roles.
- Placement-cell dashboard and authorized institutional integrations.
- Improved recommendation and assessment quality.
- Aggregate analytics to understand common student skill gaps.

Features will be marked as implemented only when they are available and tested in the application.

---

## Our Guiding Principles

### Opportunity for Every Student

A student who does not qualify for one opening should still be able to discover alternative opportunities and receive useful career guidance.

### Personalized Preparation

Students have different strengths, weaknesses, interests, and career goals. Preparation should reflect those differences.

### Actionable Feedback

Scores are useful, but clear explanations and practical next steps are more valuable for long-term improvement.

### Transparency and Accuracy

Job eligibility, compensation, and requirements should be grounded in available source information. Missing or unverified information should be clearly identified.

### Responsible AI

AI-generated assessments and recommendations should be evaluated for quality. Student data should be protected, and resume content should remain truthful.

### Student-Centered Design

The platform should help students make informed decisions rather than discourage them through a single score or rigid ranking.

---

## Expected Impact

ASPIRE aims to help students:

- Discover opportunities that align with their qualifications and goals.
- Understand employer requirements before applying.
- Prepare for technical and aptitude assessments in a structured manner.
- Identify and address weaknesses through measurable practice.
- Present their qualifications more effectively through tailored resumes.
- Track their career preparation in one place.
- Continue improving even when they are not eligible for a particular placement drive.

The platform's effectiveness will be evaluated through measurable outcomes such as relevant job discovery, assessment participation, skill-score improvement, resume completion, and student feedback.

---

---

## Platform Architecture & Technical Implementation

ASPIRE is built with a modern full-stack architecture designed for high throughput, responsiveness, and clean aesthetics:

- **Frontend:** React 19, Vite, Tailwind CSS with custom 3D card elevation effects, Lucide icons, responsive navigation with unified white & blue SaaS styling.
- **Backend:** FastAPI (Python 3.12+), Pydantic v2 schemas, JWT authentication, OAuth2 password flow, MongoDB Atlas motor/pymongo database driver.
- **Administrative Suite:** Administrative user management, verified recruiter provisioning with automatic company profile linkage, and audit logging.
- **Student Placement Suite:** Pre-gated job application system with academic rule checking (CGPA, active backlogs, passing batches, departments), AI-driven diagnostic assessments, skill gap matrices, and ATS resume generation.

## Project Status

**Status:** Production Ready / Active Development

ASPIRE features complete page protection, 3D card elevation effects, multi-role authentication (Student, Recruiter, Admin), and full-stack REST API capabilities.

## Contributing

Contributions, suggestions, and feedback are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Submit a pull request describing the improvements.

Please avoid committing API keys, credentials, personal student records, or other sensitive information.

## Disclaimer

ASPIRE is an independent career preparation project and is not an official placement portal or recruitment partner unless formally authorized. Job listings, salary details, eligibility requirements, and application deadlines should be verified against their original sources. Recommendations and practice-test scores do not guarantee eligibility, interview selection, or employment.

---

## Our Vision

We envision a future where students are not left without direction when they miss a placement opportunity. Instead, they can understand their strengths, discover alternative paths, develop the skills they need, and prepare with confidence.

**ASPIRE is built around one belief: every student deserves not only an opportunity to apply, but also a way to understand, prepare, and improve.**