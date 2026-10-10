"""Company Management Router."""

from datetime import datetime
from typing import Any, Dict, List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo.database import Database

from app.core.deps import get_current_recruiter, get_current_user, get_database
from app.schemas.common import ApiResponse
from app.schemas.job import CompanyCreate, CompanyResponse, CompanyUpdate

router = APIRouter()


@router.get("", response_model=ApiResponse[List[CompanyResponse]])
def list_companies(
    industry: str = Query(None, description="Filter by industry"),
    db: Database = Depends(get_database),
) -> Any:
    """Lists published company directory with optional industry filter."""
    filter_query = {}
    if industry:
        filter_query["industry"] = {"$regex": industry, "$options": "i"}

    companies_cursor = db["companies"].find(filter_query)
    results = [
        CompanyResponse(
            id=str(c["_id"]),
            name=c["name"],
            website=c.get("website"),
            industry=c["industry"],
            description=c["description"],
            recruiter_id=str(c["recruiter_id"]),
            created_at=c.get("created_at", datetime.utcnow()),
            updated_at=c.get("updated_at", datetime.utcnow()),
        )
        for c in companies_cursor
    ]
    return ApiResponse(data=results)


@router.get("/{company_id}", response_model=ApiResponse[CompanyResponse])
def get_company_details(
    company_id: str,
    db: Database = Depends(get_database),
) -> Any:
    """Retrieves specific company details by ID."""
    if not ObjectId.is_valid(company_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid company ID.")

    company = db["companies"].find_one({"_id": ObjectId(company_id)})
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found.")

    return ApiResponse(
        data=CompanyResponse(
            id=str(company["_id"]),
            name=company["name"],
            website=company.get("website"),
            industry=company["industry"],
            description=company["description"],
            recruiter_id=str(company["recruiter_id"]),
            created_at=company.get("created_at", datetime.utcnow()),
            updated_at=company.get("updated_at", datetime.utcnow()),
        )
    )


@router.post("", response_model=ApiResponse[CompanyResponse], status_code=status.HTTP_201_CREATED)
def create_company(
    payload: CompanyCreate,
    recruiter_ctx: Dict[str, Any] = Depends(get_current_recruiter),
    db: Database = Depends(get_database),
) -> Any:
    """Creates a new company record (recruiter only)."""
    profile = recruiter_ctx["profile"]
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruiter profile not found.")

    now = datetime.utcnow()
    doc = {
        "name": payload.name,
        "website": payload.website,
        "industry": payload.industry,
        "description": payload.description,
        "recruiter_id": profile["_id"],
        "created_at": now,
        "updated_at": now,
    }
    result = db["companies"].insert_one(doc)
    doc["_id"] = result.inserted_id

    return ApiResponse(
        message="Company created successfully.",
        data=CompanyResponse(
            id=str(doc["_id"]),
            name=doc["name"],
            website=doc.get("website"),
            industry=doc["industry"],
            description=doc["description"],
            recruiter_id=str(doc["recruiter_id"]),
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
        ),
    )


@router.put("/{company_id}", response_model=ApiResponse[CompanyResponse])
def update_company(
    company_id: str,
    payload: CompanyUpdate,
    recruiter_ctx: Dict[str, Any] = Depends(get_current_recruiter),
    db: Database = Depends(get_database),
) -> Any:
    """Updates company profile (must be managing recruiter or admin)."""
    if not ObjectId.is_valid(company_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid company ID.")

    company = db["companies"].find_one({"_id": ObjectId(company_id)})
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found.")

    profile = recruiter_ctx["profile"]
    if profile and str(company["recruiter_id"]) != str(profile["_id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not manage this company.")

    update_fields = payload.model_dump(exclude_unset=True)
    update_fields["updated_at"] = datetime.utcnow()

    db["companies"].update_one({"_id": ObjectId(company_id)}, {"$set": update_fields})
    updated = db["companies"].find_one({"_id": ObjectId(company_id)})

    return ApiResponse(
        message="Company updated successfully.",
        data=CompanyResponse(
            id=str(updated["_id"]),
            name=updated["name"],
            website=updated.get("website"),
            industry=updated["industry"],
            description=updated["description"],
            recruiter_id=str(updated["recruiter_id"]),
            created_at=updated["created_at"],
            updated_at=updated["updated_at"],
        ),
    )
