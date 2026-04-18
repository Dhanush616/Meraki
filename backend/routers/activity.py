from fastapi import APIRouter, Depends, Query
from typing import Optional
from core.supabase import get_supabase_client
from core.security import get_current_user_id

router = APIRouter()


@router.get("")
async def list_activity(
    user_id: str = Depends(get_current_user_id),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    action: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    supabase = get_supabase_client()
    offset = (page - 1) * limit

    query = (
        supabase.table("activity_logs")
        .select("*", count="exact")
        .eq("owner_id", user_id)
    )

    if action:
        query = query.eq("action", action)
    if start_date:
        query = query.gte("created_at", start_date)
    if end_date:
        query = query.lte("created_at", end_date + "T23:59:59Z")
    if search:
        query = query.ilike("entity_type", f"%{search}%")

    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()

    return {
        "logs": result.data or [],
        "total": result.count or 0,
        "page": page,
        "limit": limit,
    }
