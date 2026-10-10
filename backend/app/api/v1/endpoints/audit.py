"""Audit Trail and System Logs Router."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, Query
from pymongo.database import Database

from app.core.deps import get_current_admin, get_database
from app.schemas.analytics import AuditLogResponse
from app.schemas.common import ApiResponse

router = APIRouter()


@router.get("", response_model=ApiResponse[List[AuditLogResponse]])
def list_audit_logs(
    action: Optional[str] = Query(None, description="Filter by action name"),
    entity_type: Optional[str] = Query(None, description="Filter by entity collection"),
    limit: int = Query(50, ge=1, le=200),
    admin_user: Dict[str, Any] = Depends(get_current_admin),
    db: Database = Depends(get_database),
) -> Any:
    """Lists system security and operational audit logs (Admin only)."""
    query = {}
    if action:
        query["action"] = action
    if entity_type:
        query["entity_type"] = entity_type

    cursor = db["audit_logs"].find(query).sort("created_at", -1).limit(limit)
    results = []
    for log in cursor:
        user = db["users"].find_one({"_id": log.get("user_id")})
        results.append(
            AuditLogResponse(
                id=str(log["_id"]),
                user_id=str(log["user_id"]),
                user_email=user.get("email") if user else None,
                action=log["action"],
                entity_type=log["entity_type"],
                entity_id=str(log.get("entity_id")),
                metadata=log.get("metadata"),
                created_at=log.get("created_at", datetime.utcnow()),
            )
        )
    return ApiResponse(data=results)
