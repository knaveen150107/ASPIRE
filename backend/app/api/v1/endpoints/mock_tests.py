"""Mock Assessments, Questions Delivery, and Result Evaluation Router."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.core.deps import get_current_student, get_database
from app.schemas.assessment import (
    MockTestCreate,
    MockTestResponse,
    QuestionOption,
    TestQuestionPublicResponse,
    TestResultResponse,
    TestSubmissionRequest,
    TopicScoreResponse,
)
from app.schemas.common import ApiResponse

router = APIRouter()


@router.post("", response_model=ApiResponse[MockTestResponse], status_code=status.HTTP_201_CREATED)
def create_mock_test(
    payload: MockTestCreate,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Creates a new mock test practice session."""
    profile = student_ctx["profile"]
    if not profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile is incomplete.")

    job_oid = ObjectId(payload.job_id) if payload.job_id and ObjectId.is_valid(payload.job_id) else None
    now = datetime.utcnow()

    test_doc = {
        "student_id": profile["_id"],
        "job_id": job_oid,
        "title": payload.title,
        "difficulty": payload.difficulty,
        "status": "created",
        "started_at": now,
        "completed_at": None,
        "created_at": now,
    }
    result = db["mock_tests"].insert_one(test_doc)
    test_id = result.inserted_id

    # Insert questions if provided
    q_count = 0
    if payload.questions:
        for q in payload.questions:
            skill_oid = ObjectId(q.skill_id) if ObjectId.is_valid(q.skill_id) else None
            if not skill_oid:
                continue
            q_doc = {
                "mock_test_id": test_id,
                "skill_id": skill_oid,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "options": [opt.model_dump() for opt in q.options] if q.options else None,
                "correct_answer": q.correct_answer,  # Securely stored
                "explanation": q.explanation,
                "marks": q.marks,
                "created_at": now,
            }
            db["test_questions"].insert_one(q_doc)
            q_count += 1

    return ApiResponse(
        message="Mock test created successfully.",
        data=MockTestResponse(
            id=str(test_id),
            student_id=str(profile["_id"]),
            job_id=str(job_oid) if job_oid else None,
            title=payload.title,
            difficulty=payload.difficulty,
            status="created",
            started_at=now,
            created_at=now,
            questions_count=q_count,
        ),
    )


@router.get("/me", response_model=ApiResponse[List[MockTestResponse]])
def list_my_mock_tests(
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Lists assessment history for the current student."""
    profile = student_ctx["profile"]
    if not profile:
        return ApiResponse(data=[])

    tests_cursor = db["mock_tests"].find({"student_id": profile["_id"]}).sort("created_at", -1)
    results = []
    for t in tests_cursor:
        q_count = db["test_questions"].count_documents({"mock_test_id": t["_id"]})
        results.append(
            MockTestResponse(
                id=str(t["_id"]),
                student_id=str(t["student_id"]),
                job_id=str(t["job_id"]) if t.get("job_id") else None,
                title=t["title"],
                difficulty=t.get("difficulty", "intermediate"),
                status=t.get("status", "created"),
                started_at=t.get("started_at"),
                completed_at=t.get("completed_at"),
                created_at=t.get("created_at", datetime.utcnow()),
                questions_count=q_count,
            )
        )
    return ApiResponse(data=results)


@router.get("/{test_id}/questions", response_model=ApiResponse[List[TestQuestionPublicResponse]])
def get_mock_test_questions(
    test_id: str,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Returns test questions with answer keys securely omitted for test taking."""
    if not ObjectId.is_valid(test_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid test ID.")

    questions_cursor = db["test_questions"].find({"mock_test_id": ObjectId(test_id)})
    results = []
    for q in questions_cursor:
        skill = db["skills"].find_one({"_id": q.get("skill_id")})
        options_list = [QuestionOption(id=opt["id"], text=opt["text"]) for opt in q.get("options", [])] if q.get("options") else None
        results.append(
            TestQuestionPublicResponse(
                id=str(q["_id"]),
                mock_test_id=str(q["mock_test_id"]),
                skill_id=str(q["skill_id"]),
                skill_name=skill.get("name") if skill else None,
                question_text=q["question_text"],
                question_type=q["question_type"],
                options=options_list,
                marks=q.get("marks", 1.0),
            )
        )
    return ApiResponse(data=results)


@router.post("/{test_id}/submit", response_model=ApiResponse[TestResultResponse])
def submit_mock_test(
    test_id: str,
    payload: TestSubmissionRequest,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Submits test answers, evaluates responses against answer keys, and produces result."""
    profile = student_ctx["profile"]
    if not profile or not ObjectId.is_valid(test_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid profile or test ID.")

    test = db["mock_tests"].find_one({"_id": ObjectId(test_id), "student_id": profile["_id"]})
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mock test session not found.")

    questions = list(db["test_questions"].find({"mock_test_id": ObjectId(test_id)}))
    q_map = {str(q["_id"]): q for q in questions}

    total_score = 0.0
    total_possible_marks = 0.0
    correct_count = 0
    now = datetime.utcnow()

    topic_totals: Dict[str, Dict[str, float]] = {}

    # Temporary placeholder for result ID
    temp_result_id = ObjectId()
    response_docs = []

    for sub in payload.responses:
        q = q_map.get(sub.question_id)
        if not q:
            continue

        skill_id_str = str(q["skill_id"])
        q_marks = float(q.get("marks", 1.0))
        total_possible_marks += q_marks

        if skill_id_str not in topic_totals:
            topic_totals[skill_id_str] = {"score": 0.0, "total": 0.0}
        topic_totals[skill_id_str]["total"] += q_marks

        correct_ans = q.get("correct_answer")
        is_correct = False
        awarded = 0.0

        if sub.answer is not None and str(sub.answer).strip().lower() == str(correct_ans).strip().lower():
            is_correct = True
            awarded = q_marks
            correct_count += 1
            total_score += awarded
            topic_totals[skill_id_str]["score"] += awarded

        response_docs.append({
            "result_id": temp_result_id,
            "question_id": q["_id"],
            "answer": sub.answer,
            "is_correct": is_correct,
            "marks_awarded": awarded,
            "submitted_at": now,
        })

    percentage = (total_score / total_possible_marks * 100.0) if total_possible_marks > 0 else 0.0

    topic_scores = []
    for skill_str, tdata in topic_totals.items():
        skill_doc = db["skills"].find_one({"_id": ObjectId(skill_str)})
        t_perc = (tdata["score"] / tdata["total"] * 100.0) if tdata["total"] > 0 else 0.0
        topic_scores.append({
            "skill_id": ObjectId(skill_str),
            "skill_name": skill_doc.get("name") if skill_doc else None,
            "score": tdata["score"],
            "total_marks": tdata["total"],
            "percentage": t_perc,
        })

    result_doc = {
        "_id": temp_result_id,
        "mock_test_id": ObjectId(test_id),
        "student_id": profile["_id"],
        "score": total_score,
        "percentage": round(percentage, 2),
        "correct_count": correct_count,
        "total_questions": len(questions),
        "topic_scores": topic_scores,
        "evaluated_at": now,
    }

    db["test_results"].insert_one(result_doc)
    if response_docs:
        db["question_responses"].insert_many(response_docs)

    # Mark mock test as completed
    db["mock_tests"].update_one(
        {"_id": ObjectId(test_id)},
        {"$set": {"status": "completed", "completed_at": now}},
    )

    return ApiResponse(
        message="Test evaluated successfully.",
        data=TestResultResponse(
            id=str(result_doc["_id"]),
            mock_test_id=str(test_id),
            student_id=str(profile["_id"]),
            score=total_score,
            percentage=round(percentage, 2),
            correct_count=correct_count,
            total_questions=len(questions),
            topic_scores=[
                TopicScoreResponse(
                    skill_id=str(ts["skill_id"]),
                    skill_name=ts.get("skill_name"),
                    score=ts["score"],
                    total_marks=ts["total_marks"],
                    percentage=ts.get("percentage"),
                )
                for ts in topic_scores
            ],
            evaluated_at=now,
        ),
    )


@router.get("/{test_id}/result", response_model=ApiResponse[TestResultResponse])
def get_mock_test_result(
    test_id: str,
    student_ctx: Dict[str, Any] = Depends(get_current_student),
    db: Database = Depends(get_database),
) -> Any:
    """Retrieves scorecard for a completed assessment."""
    if not ObjectId.is_valid(test_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid test ID.")

    result = db["test_results"].find_one({"mock_test_id": ObjectId(test_id)})
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found for this test.")

    return ApiResponse(
        data=TestResultResponse(
            id=str(result["_id"]),
            mock_test_id=str(result["mock_test_id"]),
            student_id=str(result["student_id"]),
            score=result["score"],
            percentage=result["percentage"],
            correct_count=result["correct_count"],
            total_questions=result["total_questions"],
            topic_scores=[
                TopicScoreResponse(
                    skill_id=str(ts["skill_id"]),
                    skill_name=ts.get("skill_name"),
                    score=ts["score"],
                    total_marks=ts["total_marks"],
                    percentage=ts.get("percentage"),
                )
                for ts in result.get("topic_scores", [])
            ],
            evaluated_at=result["evaluated_at"],
        )
    )
