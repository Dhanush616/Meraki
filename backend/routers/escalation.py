from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.supabase import get_supabase_client
from core.security import get_current_user_id

router = APIRouter()


@router.get("/settings")
def get_escalation_settings(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()
    resp = supabase.table("escalation_settings").select("*").eq("owner_id", user_id).execute()
    if not resp.data:
        return {
            "owner_id": user_id,
            "current_escalation_level": "level_0_normal",
            "check_in_frequency_days": 90,
            "inactivity_threshold_days": 90,
            "vacation_mode_active": False,
            "last_check_in_responded_at": None,
            "last_login_detected_at": None,
        }
    return resp.data[0]


class EscalationSettingsUpdate(BaseModel):
    check_in_frequency_days: Optional[int] = None
    inactivity_threshold_days: Optional[int] = None
    vacation_mode_active: Optional[bool] = None
    vacation_mode_start: Optional[str] = None
    vacation_mode_end: Optional[str] = None


@router.put("/settings")
def update_escalation_settings(
    body: EscalationSettingsUpdate,
    user_id: str = Depends(get_current_user_id),
):
    supabase = get_supabase_client()
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")

    existing = supabase.table("escalation_settings").select("id").eq("owner_id", user_id).execute()
    if existing.data:
        supabase.table("escalation_settings").update(update).eq("owner_id", user_id).execute()
    else:
        supabase.table("escalation_settings").insert({"owner_id": user_id, **update}).execute()

    return {"message": "Settings updated"}


@router.get("/log")
def get_escalation_log(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()
    resp = (
        supabase.table("escalation_log")
        .select("*")
        .eq("owner_id", user_id)
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )
    return resp.data or []


@router.post("/respond/{token}")
async def respond_to_check_in(token: str):
    """Public — no auth. Called when owner clicks the emailed check-in link."""
    from services.escalation_service import respond_to_check_in as _respond
    supabase = get_supabase_client()
    result = await _respond(supabase, token)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result.get("reason", "Token not found"))
    return {"message": "Check-in confirmed. Thank you!"}
