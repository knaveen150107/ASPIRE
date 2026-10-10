"""Master Skills Ontology Router."""

from datetime import datetime
from typing import Any, List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo.database import Database

from app.core.deps import get_current_user, get_database
from app.schemas.common import ApiResponse
from app.schemas.job import SkillCreate, SkillResponse

router = APIRouter()


@router.get("", response_model=ApiResponse[List[SkillResponse]])
def list_skills(
    category: Optional[str] = Query(None, description="Filter skills by category"),
    search: Optional[str] = Query(None, description="Search skills by name"),
    db: Database = Depends(get_database),
) -> Any:
    """Lists standard competency skills."""
    query = {}
    if category:
        query["category"] = category
    if search:
        query["name"] = {"$regex": search, "$options": "i"}

    skills_cursor = db["skills"].find(query).sort("name", 1)
    results = [
        SkillResponse(
            id=str(s["_id"]),
            name=s["name"],
            category=s["category"],
            description=s.get("description"),
            created_at=s.get("created_at", datetime.now()),
        )
        for s in skills_cursor
    ]
    return ApiResponse(data=results)


@router.post("", response_model=ApiResponse[SkillResponse], status_code=status.HTTP_201_CREATED)
def create_skill(
    payload: SkillCreate,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_database),
) -> Any:
    """Creates a new canonical skill definition."""
    existing = db["skills"].find_one({"name": {"$regex": f"^{payload.name}$", "$options": "i"}})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Skill already exists.")

    now = datetime.now()
    doc = {
        "name": payload.name,
        "category": payload.category,
        "description": payload.description,
        "created_at": now,
    }
    result = db["skills"].insert_one(doc)
    doc["_id"] = result.inserted_id

    return ApiResponse(
        message="Skill created.",
        data=SkillResponse(
            id=str(doc["_id"]),
            name=doc["name"],
            category=doc["category"],
            description=doc.get("description"),
            created_at=doc["created_at"],
        ),
    )
