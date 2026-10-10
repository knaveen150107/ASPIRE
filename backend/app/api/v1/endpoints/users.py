"""User Management Router."""

from datetime import datetime
from typing import Any, Dict, List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo.database import Database

from app.core.deps import get_current_admin, get_database
from app.core.security import get_password_hash
from app.schemas.auth import CreateRecruiterRequest, UserResponse
from app.schemas.common import ApiResponse

router = APIRouter()


@router.get("", response_model=ApiResponse[List[UserResponse]])
def list_all_users(
    role: str = Query(None, description="Filter by role"),
    admin_user: Dict[str, Any] = Depends(get_current_admin),
    db: Database = Depends(get_database),
) -> Any:
    """Lists registered users enriched with profile metadata (Admin only)."""
    query = {}
    if role:
        query["role"] = role

    cursor = db["users"].find(query).sort("created_at", -1)
    results = []

    for u in cursor:
        uid = u["_id"]
        u_role = u.get("role", "student")
        
        # Default metadata
        reg_num = None
        dept = None
        degree = None
        grad_year = None
        cgpa = None
        backlogs = 0
        skills_count = 0
        resume_uploaded = False
        company_name = None

        if u_role == "student":
            prof = db["student_profiles"].find_one({"user_id": uid})
            if prof:
                reg_num = prof.get("register_number")
                dept = prof.get("department")
                degree = prof.get("degree")
                grad_year = prof.get("graduation_year")
                cgpa = prof.get("cgpa")
                backlogs = prof.get("active_backlogs", 0)
            
            # Count skills
            skills_count = db["student_skills"].count_documents({"student_id": uid})
            if skills_count == 0:
                skills_count = db["student_skills"].count_documents({"student_id": str(uid)})
            
            # Check resume
            resume_count = db["resumes"].count_documents({"student_id": uid})
            if resume_count == 0:
                resume_count = db["resumes"].count_documents({"student_id": str(uid)})
            resume_uploaded = resume_count > 0 or skills_count > 0

        elif u_role == "recruiter":
            rec_prof = db["recruiter_profiles"].find_one({"user_id": uid})
            if rec_prof and rec_prof.get("company_id"):
                comp = db["companies"].find_one({"_id": rec_prof["company_id"]})
                if comp:
                    company_name = comp.get("name")

        results.append(
            UserResponse(
                id=str(uid),
                name=u.get("name", "Unnamed User"),
                email=u.get("email", ""),
                role=u_role,
                is_active=u.get("is_active", True),
                created_at=u.get("created_at", datetime.now()),
                updated_at=u.get("updated_at", datetime.now()),
                register_number=reg_num,
                department=dept or "Computer Science",
                degree=degree or "B.Tech",
                graduation_year=grad_year or 2026,
                cgpa=cgpa if cgpa is not None else 8.2,
                active_backlogs=backlogs,
                skills_count=skills_count,
                resume_uploaded=resume_uploaded,
                company_name=company_name,
            )
        )

    return ApiResponse(data=results)


@router.post("/recruiters", response_model=ApiResponse[UserResponse], status_code=status.HTTP_201_CREATED)
def create_recruiter_by_admin(
    payload: CreateRecruiterRequest,
    admin_user: Dict[str, Any] = Depends(get_current_admin),
    db: Database = Depends(get_database),
) -> Any:
    """Allows administrators to create and provision recruiter accounts directly."""
    existing = db["users"].find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    now = datetime.now()
    user_doc = {
        "name": payload.name,
        "email": payload.email.lower(),
        "password_hash": get_password_hash(payload.password),
        "role": "recruiter",
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }
    insert_result = db["users"].insert_one(user_doc)
    user_id = insert_result.inserted_id

    # Handle company linkage
    company_id = None
    if payload.company_name:
        comp = db["companies"].find_one({"name": payload.company_name})
        if comp:
            company_id = comp["_id"]
        else:
            comp_res = db["companies"].insert_one({
                "name": payload.company_name,
                "domain": "Technology",
                "website": f"https://{payload.company_name.lower().replace(' ', '')}.com",
                "verified": True,
                "created_at": now,
                "updated_at": now,
            })
            company_id = comp_res.inserted_id

    # Insert Recruiter Profile
    db["recruiter_profiles"].insert_one({
        "user_id": user_id,
        "company_id": company_id,
        "designation": payload.designation or "Recruiter",
        "organization_email": payload.email.lower(),
        "verified": True,
        "created_at": now,
        "updated_at": now,
    })

    # Log audit event
    admin_obj_id = ObjectId(admin_user["id"]) if ObjectId.is_valid(admin_user.get("id", "")) else None
    db["audit_logs"].insert_one({
        "user_id": admin_obj_id,
        "action": "ADMIN_CREATE_RECRUITER",
        "entity_type": "users",
        "entity_id": user_id,
        "metadata": {
            "recruiter_name": payload.name,
            "recruiter_email": payload.email,
            "company_name": payload.company_name,
        },
        "created_at": now,
    })

    return ApiResponse(
        message=f"Recruiter account for {payload.name} created successfully.",
        data=UserResponse(
            id=str(user_id),
            name=payload.name,
            email=payload.email.lower(),
            role="recruiter",
            is_active=True,
            created_at=now,
            updated_at=now,
            company_name=payload.company_name,
        ),
    )


@router.put("/{user_id}/status", response_model=ApiResponse[bool])
def update_user_status(
    user_id: str,
    is_active: bool,
    admin_user: Dict[str, Any] = Depends(get_current_admin),
    db: Database = Depends(get_database),
) -> Any:
    """Blocks/suspends or activates a user account (Admin only)."""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID.")

    u_obj_id = ObjectId(user_id)
    user = db["users"].find_one({"_id": u_obj_id})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    res = db["users"].update_one(
        {"_id": u_obj_id},
        {"$set": {"is_active": is_active, "updated_at": datetime.now()}},
    )

    # Log audit event
    admin_obj_id = ObjectId(admin_user["id"]) if ObjectId.is_valid(admin_user.get("id", "")) else None
    db["audit_logs"].insert_one({
        "user_id": admin_obj_id,
        "action": "ADMIN_UNBLOCK_USER" if is_active else "ADMIN_BLOCK_USER",
        "entity_type": "users",
        "entity_id": u_obj_id,
        "metadata": {
            "target_email": user.get("email"),
            "target_role": user.get("role"),
            "new_status": "Active" if is_active else "Blocked",
        },
        "created_at": datetime.now(),
    })

    status_label = "activated / unblocked" if is_active else "blocked / suspended"
    return ApiResponse(message=f"User account {status_label} successfully.", data=True)


@router.delete("/{user_id}", response_model=ApiResponse[bool])
def delete_user_by_admin(
    user_id: str,
    admin_user: Dict[str, Any] = Depends(get_current_admin),
    db: Database = Depends(get_database),
) -> Any:
    """Permanently removes a user account and associated profile records (Admin only)."""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID.")

    u_obj_id = ObjectId(user_id)
    user = db["users"].find_one({"_id": u_obj_id})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    # Remove user and associated collections
    db["users"].delete_one({"_id": u_obj_id})
    db["student_profiles"].delete_many({"user_id": u_obj_id})
    db["recruiter_profiles"].delete_many({"user_id": u_obj_id})
    db["admin_profiles"].delete_many({"user_id": u_obj_id})
    db["student_skills"].delete_many({"$or": [{"student_id": u_obj_id}, {"student_id": user_id}]})
    db["applications"].delete_many({"$or": [{"student_id": u_obj_id}, {"student_id": user_id}]})
    db["mock_tests"].delete_many({"$or": [{"student_id": u_obj_id}, {"student_id": user_id}]})
    db["resumes"].delete_many({"$or": [{"student_id": u_obj_id}, {"student_id": user_id}]})

    # Log audit event
    admin_obj_id = ObjectId(admin_user["id"]) if ObjectId.is_valid(admin_user.get("id", "")) else None
    db["audit_logs"].insert_one({
        "user_id": admin_obj_id,
        "action": "ADMIN_DELETE_USER",
        "entity_type": "users",
        "entity_id": u_obj_id,
        "metadata": {
            "deleted_email": user.get("email"),
            "deleted_name": user.get("name"),
            "deleted_role": user.get("role"),
        },
        "created_at": datetime.now(),
    })

    return ApiResponse(message=f"User {user.get('email')} permanently deleted.", data=True)
