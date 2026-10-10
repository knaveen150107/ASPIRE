"""ASPIRE AI Agent Service — Powered by Google Gemini (gemini-3.6-flash).

Provides multi-agent capabilities for:
1. Student Placement & Career Copilot (Interactive AI Advisor)
2. Remedial & Career Learning Roadmap Generation
3. Company-specific Mock Interview & Assessment Question Generation
4. Mock Assessment Diagnostic Evaluation
5. Deep ATS Resume Analysis & Bullet Polish Engine
6. Job Fit Radar & Prerequisite Match Explainer
7. Autonomous Placement Intelligence Agent for Admin / Background Scheduling
"""

import json
import logging
import os
import re
from datetime import datetime
from typing import Any, Dict, List, Optional
from bson import ObjectId

from app.core.config import settings

logger = logging.getLogger(__name__)

# Try importing Google GenAI SDK
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    logger.warning("google-genai SDK not available; operating in deterministic heuristic fallback mode.")


class GeminiAgentService:
    """Core AI Agent orchestrator for ASPIRE Platform."""

    def __init__(self, api_key: Optional[str] = None):
        self._override_key: Optional[str] = api_key
        self._client: Optional[Any] = None
        self._model = settings.GEMINI_MODEL or "gemini-flash-latest"

    @property
    def api_key(self) -> str:
        return self._override_key or settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")

    def set_api_key(self, key: str) -> None:
        """Dynamically configures or updates the Gemini API Key."""
        self._override_key = key
        self._client = None  # Reset client instance to reload with new key

    @property
    def is_configured(self) -> bool:
        """Returns True if a non-empty Gemini API key is configured."""
        return bool(self.api_key and len(self.api_key) > 5)

    def get_client(self) -> Optional[Any]:
        """Lazy-loads and returns an initialized Google GenAI Client."""
        if not GENAI_AVAILABLE or not self.is_configured:
            return None
        if self._client is None:
            try:
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error("Failed to initialize Google GenAI client: %s", e)
                return None
        return self._client

    def _call_gemini(self, prompt: str, system_instruction: Optional[str] = None, json_output: bool = False) -> Optional[str]:
        """Performs a Gemini model interaction with error handling and automatic model fallbacks."""
        client = self.get_client()
        if not client:
            return None

        # Try active model, followed by lightweight/flash alternatives
        candidate_models = [self._model]
        for alt in ["gemini-2.5-flash-lite", "gemini-flash-latest"]:
            if alt not in candidate_models:
                candidate_models.append(alt)

        for model_candidate in candidate_models:
            try:
                config_params: Dict[str, Any] = {
                    "temperature": 0.4 if json_output else 0.7,
                }
                if system_instruction:
                    config_params["system_instruction"] = system_instruction
                if json_output:
                    config_params["response_mime_type"] = "application/json"

                config = types.GenerateContentConfig(**config_params)
                response = client.models.generate_content(
                    model=model_candidate,
                    contents=prompt,
                    config=config,
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                logger.warning("Gemini generation attempt with %s failed (%s). Trying fallback...", model_candidate, e)

        return None

    # =========================================================================
    # 1. AI CAREER COPILOT CHAT AGENT
    # =========================================================================
    def chat_with_copilot(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        student_context: Optional[Dict[str, Any]] = None,
        target_role: Optional[str] = None,
        target_company: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Interactive career mentor and placement copilot for students."""
        history = history or []
        student_context = student_context or {}

        # Assemble rich context
        student_name = student_context.get("name", "Student")
        department = student_context.get("department", "Computer Science")
        cgpa = student_context.get("cgpa", 8.2)
        skills = student_context.get("skills", ["Python", "Data Structures", "SQL"])
        role_target = target_role or "Software Engineer / AI Engineer"
        comp_target = target_company or "Tier-1 Tech Companies (Google, Microsoft, Amazon)"

        system_instruction = (
            f"You are ASPIRE Career Copilot, an elite AI technical career mentor for engineering students. "
            f"You are guiding {student_name} ({department}, CGPA: {cgpa}). "
            f"Current verified skills: {', '.join(skills)}. Target role: {role_target} at {comp_target}. "
            f"Provide crisp, highly actionable, encouraging, and concrete advice with structured steps, code snippets, "
            f"or specific interview patterns when asked. Keep answers concise, highly readable, and formatted with markdown."
        )

        formatted_history_text = "\n".join([f"{h.get('role', 'user').upper()}: {h.get('content', '')}" for h in history[-6:]])
        prompt = (
            f"{formatted_history_text}\n"
            f"USER: {message}\n"
            f"Provide a direct response and include 3 relevant follow-up action suggestions."
        )

        llm_reply = self._call_gemini(prompt=prompt, system_instruction=system_instruction)

        if llm_reply:
            # Extract suggested actions or construct defaults
            suggested = [
                f"How to prepare for {comp_target} DSA rounds?",
                f"What projects make my resume stand out for {role_target}?",
                "Generate a 4-week remedial learning roadmap for my skill gaps",
            ]
            return {
                "reply": llm_reply,
                "suggested_actions": suggested,
                "model_used": self._model,
                "created_at": datetime.now(),
            }

        # Heuristic Deterministic Fallback
        reply = (
            f"Hello **{student_name}**! 👋\n\n"
            f"Based on your **{department}** background and target role as a **{role_target}** at **{comp_target}**, "
            f"here is targeted guidance tailored to your profile (CGPA: {cgpa}):\n\n"
            f"1. **Core Technical Competencies**: Strengthen your foundation in **{', '.join(skills[:3])}** and bridge high-frequency patterns like Trees, Graphs, and System Design.\n"
            f"2. **Portfolio & System Project**: Build 1 end-to-end full-stack or ML deployment project demonstrating clean architecture, unit testing, and Docker containerization.\n"
            f"3. **Company-Specific Prep**: Focus on LeetCode Mediums and behavioral STAR-method scenarios tailored for {comp_target}.\n\n"
            f"> *Note: Connect your Gemini API Key in Admin Settings to unlock deep real-time LLM dialogues with Gemini 3.6 Flash!*"
        )
        return {
            "reply": reply,
            "suggested_actions": [
                f"Create a custom learning roadmap for {role_target}",
                f"Start a {comp_target} mock assessment",
                "Analyze my resume against current job requirements",
            ],
            "model_used": "aspire-heuristic-copilot",
            "created_at": datetime.now(),
        }

    # =========================================================================
    # 2. AI REMEDIAL ROADMAP GENERATOR
    # =========================================================================
    def generate_roadmap(
        self,
        target_role: str,
        target_company: str = "Tier-1 Tech Companies",
        current_skills: Optional[List[str]] = None,
        missing_skills: Optional[List[str]] = None,
        target_weeks: int = 6,
    ) -> Dict[str, Any]:
        """Generates a structured week-by-week remedial learning roadmap."""
        current_skills = current_skills or ["Python", "SQL", "Git"]
        missing_skills = missing_skills or ["System Design", "Docker", "Redis", "Dynamic Programming"]

        prompt = (
            f"Generate a detailed {target_weeks}-week remedial learning roadmap for a student aiming to become a '{target_role}' at '{target_company}'.\n"
            f"Student already knows: {', '.join(current_skills)}.\n"
            f"Student needs to master: {', '.join(missing_skills)}.\n"
            f"Return a strict JSON object with this exact schema:\n"
            f"{{\n"
            f'  "role_title": "{target_role}",\n'
            f'  "target_company": "{target_company}",\n'
            f'  "summary": "overview description of the curriculum",\n'
            f'  "estimated_duration_weeks": {target_weeks},\n'
            f'  "modules": [\n'
            f"    {{\n"
            f'      "week_number": 1,\n'
            f'      "title": "Module Title",\n'
            f'      "topics": [\n'
            f"        {{\n"
            f'          "name": "Topic Name",\n'
            f'          "description": "Brief description",\n'
            f'          "key_concepts": ["concept 1", "concept 2"],\n'
            f'          "resource_links": [{{"title": "Free Documentation/Resource", "url": "https://..."}}]\n'
            f"        }}\n"
            f"      ],\n"
            f'      "milestone_project": "Hands-on project description"\n'
            f"    }}\n"
            f"  ]\n"
            f"}}"
        )

        llm_json = self._call_gemini(prompt=prompt, json_output=True)
        if llm_json:
            try:
                data = json.loads(llm_json)
                data["model_used"] = self._model
                data["generated_at"] = datetime.now()
                return data
            except Exception:
                pass

        # Heuristic Roadmap Generator
        modules = []
        for w in range(1, target_weeks + 1):
            skill_focus = missing_skills[(w - 1) % len(missing_skills)] if missing_skills else "Core Engineering"
            modules.append({
                "week_number": w,
                "title": f"Week {w}: Mastering {skill_focus} & Applied Design",
                "topics": [
                    {
                        "name": f"{skill_focus} Fundamentals & Theory",
                        "description": f"Core principles, trade-offs, and architecture of {skill_focus}.",
                        "key_concepts": [f"{skill_focus} syntax", "Best practices", "Performance trade-offs"],
                        "resource_links": [
                            {"title": f"Official {skill_focus} Documentation", "url": "https://developer.mozilla.org"},
                            {"title": "Interactive Free Tutorial", "url": "https://roadmap.sh"},
                        ],
                    },
                    {
                        "name": f"{skill_focus} Problem Solving & Edge Cases",
                        "description": f"Common interview questions and algorithmic patterns in {skill_focus}.",
                        "key_concepts": ["Complexity analysis", "Concurrency", "Optimization"],
                        "resource_links": [
                            {"title": "LeetCode Curated Problem Set", "url": "https://leetcode.com"},
                        ],
                    },
                ],
                "milestone_project": f"Build and deploy a functional {skill_focus} micro-service with automated test suites.",
            })

        return {
            "role_title": target_role,
            "target_company": target_company,
            "summary": f"Targeted {target_weeks}-week curriculum designed to bridge critical skill gaps ({', '.join(missing_skills)}) and position you for placement success at {target_company}.",
            "estimated_duration_weeks": target_weeks,
            "modules": modules,
            "model_used": "aspire-heuristic-engine",
            "generated_at": datetime.now(),
        }

    # =========================================================================
    # 3. AI MOCK INTERVIEW QUESTION GENERATOR
    # =========================================================================
    def generate_mock_questions(
        self,
        company_name: str = "Google",
        role_title: str = "Software Engineer",
        category: str = "DSA",
        difficulty: str = "medium",
        num_questions: int = 5,
    ) -> Dict[str, Any]:
        """Generates realistic company-tailored assessment questions with multiple choices."""
        prompt = (
            f"Generate {num_questions} high-quality interview multiple-choice questions matching the style of {company_name} "
            f"for a '{role_title}' role in category '{category}' with difficulty '{difficulty}'.\n"
            f"Return a strict JSON object with this exact schema:\n"
            f"{{\n"
            f'  "title": "{company_name} {category} Mock Assessment",\n'
            f'  "company_name": "{company_name}",\n'
            f'  "category": "{category}",\n'
            f'  "difficulty": "{difficulty}",\n'
            f'  "duration_minutes": {num_questions * 4},\n'
            f'  "questions": [\n'
            f"    {{\n"
            f'      "id": "q1",\n'
            f'      "question_text": "Detailed question text...",\n'
            f'      "category": "{category}",\n'
            f'      "difficulty": "{difficulty}",\n'
            f'      "code_snippet": "optional code snippet or null",\n'
            f'      "options": [\n'
            f'        {{"id": "A", "text": "Option A text"}},\n'
            f'        {{"id": "B", "text": "Option B text"}},\n'
            f'        {{"id": "C", "text": "Option C text"}},\n'
            f'        {{"id": "D", "text": "Option D text"}}\n'
            f"      ],\n"
            f'      "correct_option_id": "B",\n'
            f'      "explanation": "Clear explanation why B is correct..."\n'
            f"    }}\n"
            f"  ]\n"
            f"}}"
        )

        llm_json = self._call_gemini(prompt=prompt, json_output=True)
        if llm_json:
            try:
                data = json.loads(llm_json)
                data["model_used"] = self._model
                data["generated_at"] = datetime.now()
                return data
            except Exception:
                pass

        # Heuristic Question Bank Fallback
        sample_questions = [
            {
                "id": "q1",
                "question_text": f"What is the average time complexity of searching in a balanced Red-Black Tree or AVL Tree?",
                "category": category,
                "difficulty": difficulty,
                "code_snippet": None,
                "options": [
                    {"id": "A", "text": "O(1)"},
                    {"id": "B", "text": "O(log n)"},
                    {"id": "C", "text": "O(n)"},
                    {"id": "D", "text": "O(n log n)"},
                ],
                "correct_option_id": "B",
                "explanation": "Balanced binary search trees maintain a maximum height proportional to log2(n), guaranteeing O(log n) worst and average case lookup time.",
            },
            {
                "id": "q2",
                "question_text": f"Which algorithmic technique is most optimal to detect cycles in an undirected graph?",
                "category": category,
                "difficulty": difficulty,
                "code_snippet": "def has_cycle(adj_list):\n    # graph traversal\n    pass",
                "options": [
                    {"id": "A", "text": "Dijkstra's Algorithm"},
                    {"id": "B", "text": "Disjoint Set Union (Union-Find) or DFS"},
                    {"id": "C", "text": "Floyd-Warshall Algorithm"},
                    {"id": "D", "text": "Prim's Algorithm"},
                ],
                "correct_option_id": "B",
                "explanation": "Union-Find (DSU) or Depth-First Search (DFS) with visited tracking efficiently detects back-edges in O(V + E) time.",
            },
            {
                "id": "q3",
                "question_text": f"In database transaction management (ACID), what does the 'I' stand for and what problem does it prevent?",
                "category": "Databases & Core",
                "difficulty": difficulty,
                "code_snippet": None,
                "options": [
                    {"id": "A", "text": "Integrity — prevents foreign key violations"},
                    {"id": "B", "text": "Isolation — prevents concurrent transactions from interfering with each other"},
                    {"id": "C", "text": "Indexability — prevents unindexed full table scans"},
                    {"id": "D", "text": "Idempotency — ensures repeating operations produce identical states"},
                ],
                "correct_option_id": "B",
                "explanation": "Isolation ensures that concurrent execution of transactions leaves the database in the same state that would have been obtained if transactions were executed serially.",
            },
            {
                "id": "q4",
                "question_text": f"When designing a distributed rate limiter for a Tier-1 API (like {company_name}), which algorithm allows bursts of traffic while enforcing a strict long-term average limit?",
                "category": "System Design",
                "difficulty": difficulty,
                "code_snippet": None,
                "options": [
                    {"id": "A", "text": "Token Bucket Algorithm"},
                    {"id": "B", "text": "Fixed Window Counter"},
                    {"id": "C", "text": "Round Robin Balancer"},
                    {"id": "D", "text": "Strict FIFO Queue"},
                ],
                "correct_option_id": "A",
                "explanation": "Token Bucket stores tokens up to bucket capacity (allowing burst size) while refilling at a constant rate, making it the industry standard for API gateways.",
            },
            {
                "id": "q5",
                "question_text": "What is the primary advantage of HTTP/2 and HTTP/3 multiplexing compared to HTTP/1.1?",
                "category": "Computer Networks",
                "difficulty": difficulty,
                "code_snippet": None,
                "options": [
                    {"id": "A", "text": "Elimination of SSL encryption overhead"},
                    {"id": "B", "text": "Single TCP/QUIC connection transferring multiple bidirectional requests without head-of-line blocking"},
                    {"id": "C", "text": "Automatic conversion of JSON to XML"},
                    {"id": "D", "text": "Direct peer-to-peer browser video streaming"},
                ],
                "correct_option_id": "B",
                "explanation": "Multiplexing allows multiple interleaved request and response messages over a single connection, eliminating head-of-line blocking at the application layer.",
            },
        ]

        return {
            "title": f"{company_name} Technical Assessment Challenge",
            "company_name": company_name,
            "category": category,
            "difficulty": difficulty,
            "duration_minutes": num_questions * 3,
            "questions": sample_questions[:num_questions],
            "model_used": "aspire-heuristic-evaluator",
            "generated_at": datetime.now(),
        }

    # =========================================================================
    # 4. AI ASSESSMENT EVALUATOR & DIAGNOSTIC GRADER
    # =========================================================================
    def evaluate_submission(
        self,
        submissions: List[Dict[str, Any]],
        company_name: Optional[str] = "Tier-1 Tech",
        role_title: Optional[str] = "Software Engineer",
    ) -> Dict[str, Any]:
        """Evaluates student test answers, score, and diagnoses weaknesses."""
        total = len(submissions)
        correct = sum(1 for s in submissions if s.get("selected_option_id") == s.get("correct_option_id"))
        score_pct = round((correct / total) * 100, 1) if total > 0 else 0.0

        prompt = (
            f"Evaluate this mock test result for a student targeting '{role_title}' at '{company_name}'.\n"
            f"Total questions: {total}, Correct: {correct}, Score: {score_pct}%.\n"
            f"Submission breakdown:\n"
            f"{json.dumps(submissions, indent=2)}\n\n"
            f"Return a strict JSON object with this exact schema:\n"
            f"{{\n"
            f'  "score_percentage": {score_pct},\n'
            f'  "correct_count": {correct},\n'
            f'  "total_count": {total},\n'
            f'  "strengths": ["string", "string"],\n'
            f'  "weaknesses": ["string", "string"],\n'
            f'  "improvement_plan": ["string", "string", "string"],\n'
            f'  "readiness_rating": "Interview Ready | Approaching Target | Needs Foundation"\n'
            f"}}"
        )

        llm_json = self._call_gemini(prompt=prompt, json_output=True)
        if llm_json:
            try:
                data = json.loads(llm_json)
                data["model_used"] = self._model
                return data
            except Exception:
                pass

        # Heuristic Assessment Diagnostic
        rating = "Interview Ready" if score_pct >= 80 else "Approaching Target" if score_pct >= 60 else "Needs Foundation"
        return {
            "score_percentage": score_pct,
            "correct_count": correct,
            "total_count": total,
            "strengths": [
                f"Solid grasp of fundamental algorithmic problem solving ({correct}/{total} correct).",
                "Strong conceptual foundation in database structures and time complexity analysis.",
            ],
            "weaknesses": [
                "Edge-case identification under time pressure.",
                "Complex distributed systems patterns and concurrency trade-offs.",
            ],
            "improvement_plan": [
                f"Review detailed explanations for the {total - correct} missed questions.",
                f"Practice 5 targeted LeetCode Mediums on weak topics.",
                f"Take the {company_name} Stage-2 mock test after 48 hours of revision.",
            ],
            "readiness_rating": rating,
            "model_used": "aspire-heuristic-evaluator",
        }

    # =========================================================================
    # 5. AI RESUME DEEP ATS ANALYZER
    # =========================================================================
    def analyze_resume(
        self,
        resume_text: str,
        target_role: str = "Software Development Engineer",
    ) -> Dict[str, Any]:
        """Performs deep ATS scoring, keyword detection, and bullet improvements."""
        if not resume_text or len(resume_text.strip()) < 50:
            resume_text = "Experienced engineering student proficient in Python, React, MongoDB, FastAPI, Data Structures, and Cloud deployments."

        prompt = (
            f"Perform a professional ATS analysis on the following resume for a target role of '{target_role}':\n\n"
            f"RESUME TEXT:\n{resume_text[:4000]}\n\n"
            f"Return a strict JSON object with this exact schema:\n"
            f"{{\n"
            f'  "ats_score": 85,\n'
            f'  "candidate_level": "Entry-level | Intermediate | Senior",\n'
            f'  "top_strengths": ["strength 1", "strength 2", "strength 3"],\n'
            f'  "critical_flaws": ["flaw 1", "flaw 2"],\n'
            f'  "missing_keywords": ["keyword 1", "keyword 2", "keyword 3"],\n'
            f'  "bullet_improvements": [\n'
            f"    {{\n"
            f'      "original": "Worked on backend features",\n'
            f'      "improved": "Architected 12 RESTful endpoints in FastAPI and PostgreSQL, boosting query throughput by 42%",\n'
            f'      "reason": "Quantifies business impact using the Google XYZ formula"\n'
            f"    }}\n"
            f"  ],\n"
            f'  "overall_summary": "Executive review summary..."\n'
            f"}}"
        )

        llm_json = self._call_gemini(prompt=prompt, json_output=True)
        if llm_json:
            try:
                data = json.loads(llm_json)
                data["model_used"] = self._model
                data["overall_score"] = data.get("overall_score") or data.get("ats_score", 85)
                data["ats_score"] = data["overall_score"]
                data["format_score"] = data.get("format_score", 90)
                data["keyword_score"] = data.get("keyword_score", 88)
                data["matched_keywords"] = data.get("matched_keywords") or ["Python", "FastAPI", "React", "MongoDB"]
                data["missing_keywords"] = data.get("missing_keywords") or ["Docker", "CI/CD", "Redis"]
                data["summary_recommendations"] = data.get("overall_summary") or data.get("summary_recommendations", "ATS optimization completed.")
                return data
            except Exception:
                pass

        # Heuristic ATS Analyzer
        return {
            "ats_score": 84,
            "overall_score": 84,
            "format_score": 92,
            "keyword_score": 86,
            "candidate_level": "Entry-level Engineer",
            "top_strengths": [
                "Clear technical stack alignment with modern web & cloud standards (Python, FastAPI, React, MongoDB).",
                "Well-structured project highlights demonstrating full-lifecycle development.",
                "Good technical keyword density for software engineering ATS parsers.",
            ],
            "critical_flaws": [
                "Several project bullet points lack quantifiable metrics (e.g. latency, user counts, % speedup).",
                "Missing explicit mention of unit testing frameworks (e.g. pytest, Jest).",
            ],
            "matched_keywords": ["Python", "FastAPI", "React", "MongoDB"],
            "missing_keywords": [
                "Docker / Containerization",
                "CI/CD Pipelines (GitHub Actions)",
                "System Architecture & Microservices",
                "Automated Unit & Integration Testing",
            ],
            "bullet_improvements": [
                {
                    "original": "Built a web app for students using React and FastAPI.",
                    "improved": "Engineered a high-concurrency placement platform in React and FastAPI, reducing student job discovery time by 65% across 500+ active users.",
                    "reason": "Applies Google XYZ framework (Accomplished [X] as measured by [Y] by doing [Z]) with measurable metrics.",
                },
                {
                    "original": "Used MongoDB database to store user information.",
                    "improved": "Optimized MongoDB schema with compound indexes and JSONSchema validation, cutting query execution latency to <15ms.",
                    "reason": "Highlights deep technical competence and performance optimization.",
                },
            ],
            "overall_summary": f"Your resume demonstrates strong technical capabilities for '{target_role}'. Addressing the missing DevOps keywords and applying metric-driven action verbs will comfortably push your ATS score into the top 95th percentile.",
            "summary_recommendations": f"Your resume demonstrates strong technical capabilities for '{target_role}'. Addressing the missing DevOps keywords and applying metric-driven action verbs will comfortably push your ATS score into the top 95th percentile.",
            "model_used": "aspire-heuristic-analyzer",
        }

    # =========================================================================
    # 6. AI JOB FIT & RADAR EXPLAINER
    # =========================================================================
    def explain_job_fit(
        self,
        job_data: Dict[str, Any],
        student_profile: Dict[str, Any],
        student_skills: List[str],
    ) -> Dict[str, Any]:
        """Provides an explainable fit breakdown between a student and a job opening."""
        job_title = job_data.get("title", "Software Engineer")
        company = job_data.get("company_name", "Tech Corp")
        required_skills = job_data.get("skills_required", ["Python", "Algorithms", "Databases"])
        min_cgpa = job_data.get("min_cgpa", 7.0)

        student_cgpa = student_profile.get("cgpa", 8.0)
        backlogs = student_profile.get("active_backlogs", 0)

        # Match computation
        matched = [s for s in required_skills if any(s.lower() in us.lower() or us.lower() in s.lower() for us in student_skills)]
        missing = [s for s in required_skills if s not in matched]

        skill_pct = (len(matched) / len(required_skills) * 100) if required_skills else 85.0
        cgpa_eligible = student_cgpa >= min_cgpa and backlogs == 0

        overall_score = round(min(98.0, max(25.0, (skill_pct * 0.7) + (30.0 if cgpa_eligible else 10.0))), 1)

        prompt = (
            f"Explain the job fit between a student and this job opening:\n"
            f"JOB: {job_title} at {company}. Requirements: {', '.join(required_skills)}. Min CGPA: {min_cgpa}.\n"
            f"STUDENT: CGPA {student_cgpa}, Backlogs: {backlogs}. Skills: {', '.join(student_skills)}.\n"
            f"MATCHED: {', '.join(matched)}. MISSING: {', '.join(missing)}. Score: {overall_score}%.\n\n"
            f"Return a strict JSON object with this exact schema:\n"
            f"{{\n"
            f'  "tailored_advice": "strategic advice on how to secure an interview and clear rounds",\n'
            f'  "recommended_projects": ["project idea 1 tailored to missing skills", "project idea 2"]\n'
            f"}}"
        )

        llm_json = self._call_gemini(prompt=prompt, json_output=True)
        advice = None
        projects = []
        if llm_json:
            try:
                parsed = json.loads(llm_json)
                advice = parsed.get("tailored_advice")
                projects = parsed.get("recommended_projects", [])
            except Exception:
                pass

        if not advice:
            advice = (
                f"You have a strong match ({overall_score}%) for the {job_title} role at {company}. "
                f"Highlight your proficiency in {', '.join(matched or student_skills[:3])} in your cover letter, and spend 1 week building a prototype demonstrating {', '.join(missing[:2]) or 'distributed systems'}."
            )
        if not projects:
            projects = [
                f"Build a showcase project combining {matched[0] if matched else 'Python'} with {missing[0] if missing else 'Redis caching'}.",
                f"Contribute an open-source bug fix or feature related to {company}'s tech domain.",
            ]

        eligibility_reasons = []
        if student_cgpa >= min_cgpa:
            eligibility_reasons.append(f"CGPA {student_cgpa} exceeds minimum cutoff of {min_cgpa}.")
        else:
            eligibility_reasons.append(f"CGPA {student_cgpa} is below minimum requirement of {min_cgpa}.")
        if backlogs == 0:
            eligibility_reasons.append("Zero active backlogs criteria satisfied.")
        else:
            eligibility_reasons.append(f"{backlogs} active backlogs pending.")

        return {
            "job_id": str(job_data.get("_id", job_data.get("id", "job_1"))),
            "job_title": job_title,
            "company_name": company,
            "overall_match_score": overall_score,
            "fit_score": overall_score,
            "eligible": cgpa_eligible,
            "eligibility_reasons": eligibility_reasons,
            "matched_skills": matched,
            "missing_skills": missing,
            "strengths": [f"Direct core competency match: {', '.join(matched)}"] if matched else ["Strong algorithmic baseline"],
            "tailored_advice": advice,
            "fit_summary": advice,
            "recommended_projects": projects,
            "interview_prep_tips": [
                f"Review high-frequency coding patterns relevant to {company}.",
                f"Prepare system design talking points for projects using {', '.join(matched[:2]) or 'Python'}.",
                f"Review fundamentals in {', '.join(missing[:2]) if missing else 'concurrency & scalability'}."
            ],
            "model_used": self._model if self.is_configured else "aspire-heuristic-matcher",
        }

    # =========================================================================
    # 7. AUTONOMOUS PLACEMENT AGENT CYCLE (ADMIN / BACKGROUND)
    # =========================================================================
    def run_autonomous_matching_cycle(self, db: Any, admin_user: Dict[str, Any], dry_run: bool = False) -> Dict[str, Any]:
        """Scans all active jobs against students, generates notifications & audit telemetry."""
        now = datetime.now()
        active_jobs = list(db["jobs"].find({"is_active": True}))
        students = list(db["users"].find({"role": "student", "is_active": True}))

        matches_found = 0
        notifications_dispatched = 0

        for job in active_jobs:
            req_skills = job.get("skills_required", [])
            min_cgpa = job.get("min_cgpa", 7.0)

            for student in students:
                prof = db["student_profiles"].find_one({"user_id": student["_id"]})
                cgpa = prof.get("cgpa", 8.0) if prof else 8.0
                backlogs = prof.get("active_backlogs", 0) if prof else 0

                if cgpa >= min_cgpa and backlogs == 0:
                    matches_found += 1
                    if not dry_run and prof:
                        # Check if notification already sent for this job
                        existing_notif = db["notifications"].find_one({
                            "student_id": prof["_id"],
                            "title": f"High Match Job: {job.get('title')}",
                        })
                        if not existing_notif:
                            db["notifications"].insert_one({
                                "student_id": prof["_id"],
                                "title": f"High Match Job: {job.get('title')}",
                                "message": f"ASPIRE AI matched you with {job.get('title')} at {job.get('company_name')} based on your profile & skills.",
                                "is_read": False,
                                "created_at": now,
                            })
                            notifications_dispatched += 1

        # Audit Event
        admin_obj_id = admin_user.get("_id") or (ObjectId(admin_user["id"]) if admin_user.get("id") and ObjectId.is_valid(admin_user["id"]) else None)
        if not dry_run:
            db["audit_logs"].insert_one({
                "user_id": admin_obj_id,
                "action": "AI_AGENT_MATCHING_CYCLE",
                "entity_type": "ai_agent",
                "entity_id": admin_obj_id,
                "metadata": {
                    "jobs_evaluated": len(active_jobs),
                    "students_scanned": len(students),
                    "matches_found": matches_found,
                    "notifications_dispatched": notifications_dispatched,
                    "model_used": self._model if self.is_configured else "heuristic-agent",
                },
                "created_at": now,
            })

        return {
            "status": "completed",
            "jobs_evaluated": len(active_jobs),
            "students_scanned": len(students),
            "matches_found": matches_found,
            "notifications_dispatched": notifications_dispatched,
            "model_used": self._model if self.is_configured else "aspire-heuristic-agent",
            "executed_at": now,
        }


# Singleton service instance
ai_agent_service = GeminiAgentService()
