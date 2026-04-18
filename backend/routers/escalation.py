from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from typing import Optional, List
from core.supabase import get_supabase_client
from core.security import get_current_user_id
from datetime import datetime, timezone

router = APIRouter()


@router.get("/settings")
def get_escalation_settings(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()
    resp = supabase.table("escalation_settings").select("*").eq("owner_id", user_id).execute()
    if not resp.data:
        # Auto-create if not exists (though the trigger should handle it)
        new_settings = {
            "owner_id": user_id,
            "current_escalation_level": "level_0_normal",
            "check_in_frequency_days": 90,
            "inactivity_threshold_days": 90,
            "vacation_mode_active": False,
        }
        supabase.table("escalation_settings").insert(new_settings).execute()
        return new_settings
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

    supabase.table("escalation_settings").update(update).eq("owner_id", user_id).execute()
    return {"message": "Settings updated"}


@router.post("/vacation")
async def activate_vacation_mode(
    start_date: str = Body(..., embed=True),
    end_date: str = Body(..., embed=True),
    user_id: str = Depends(get_current_user_id),
):
    supabase = get_supabase_client()
    update = {
        "vacation_mode_active": True,
        "vacation_mode_start": start_date,
        "vacation_mode_end": end_date,
    }
    supabase.table("escalation_settings").update(update).eq("owner_id", user_id).execute()
    
    # Optional: Log activity
    supabase.table("activity_logs").insert({
        "owner_id": user_id,
        "action": "vacation.activated",
        "entity_type": "escalation",
        "metadata": {"start": start_date, "end": end_date}
    }).execute()
    
    return {"message": "Vacation mode activated"}


@router.delete("/vacation")
async def deactivate_vacation_mode(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()
    update = {
        "vacation_mode_active": False,
        "vacation_mode_start": None,
        "vacation_mode_end": None,
    }
    supabase.table("escalation_settings").update(update).eq("owner_id", user_id).execute()
    
    # Optional: Log activity
    supabase.table("activity_logs").insert({
        "owner_id": user_id,
        "action": "vacation.deactivated",
        "entity_type": "escalation"
    }).execute()
    
    return {"message": "Vacation mode deactivated"}


class EmergencyContactBody(BaseModel):
    full_name: str
    relationship: str
    phone_number: str  # Encrypted on frontend
    email: Optional[str] = None  # Encrypted on frontend


@router.get("/emergency-contact")
async def get_emergency_contact(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()
    resp = supabase.table("emergency_contacts").select("*").eq("owner_id", user_id).execute()
    return resp.data[0] if resp.data else None


@router.put("/emergency-contact")
async def update_emergency_contact(
    body: EmergencyContactBody,
    user_id: str = Depends(get_current_user_id),
):
    supabase = get_supabase_client()
    data = body.model_dump()
    data["owner_id"] = user_id

    existing = supabase.table("emergency_contacts").select("id").eq("owner_id", user_id).execute()
    if existing.data:
        supabase.table("emergency_contacts").update(data).eq("owner_id", user_id).execute()
    else:
        supabase.table("emergency_contacts").insert(data).execute()

    return {"message": "Emergency contact updated"}


@router.get("/beneficiary-order")
async def get_beneficiary_order(user_id: str = Depends(get_current_user_id)):
    """Fetch beneficiaries in their contact order."""
    supabase = get_supabase_client()
    try:
        resp = (
            supabase.table("beneficiaries")
            .select("id, full_name, relationship, disclosure_level, contact_order")
            .eq("owner_id", user_id)
            .order("contact_order", nullsfirst=False)
            .execute()
        )
        return resp.data or []
    except Exception as e:
        # Fallback to created_at if contact_order column is missing
        resp = (
            supabase.table("beneficiaries")
            .select("id, full_name, relationship, disclosure_level")
            .eq("owner_id", user_id)
            .order("created_at")
            .execute()
        )
        return resp.data or []


@router.put("/beneficiary-order")
async def update_beneficiary_order(
    ordered_ids: List[str] = Body(..., embed=True),
    user_id: str = Depends(get_current_user_id),
):
    """Update contact_order for each beneficiary."""
    supabase = get_supabase_client()
    for index, b_id in enumerate(ordered_ids):
        supabase.table("beneficiaries").update({"contact_order": index}).eq("id", b_id).eq("owner_id", user_id).execute()
    
    return {"message": "Beneficiary contact order updated"}


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
