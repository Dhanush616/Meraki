from fastapi import APIRouter, Depends
from typing import Dict, Any
from core.supabase import get_supabase_client
from core.security import get_current_user_id

router = APIRouter()

@router.get("/summary", response_model=Dict[str, Any])
async def get_vault_summary(user_id: str = Depends(get_current_user_id)):
    """Get the dashboard summary mapping to PG view `vault_summary`."""
    supabase = get_supabase_client()
    
    # Query the view created in schema.sql for vault_summary
    response = supabase.table("vault_summary").select("*").eq("owner_id", user_id).execute()
    
    # Also fetch recent activity (last 5)
    activity_response = supabase.table("activity_logs").select("*").eq("owner_id", user_id).order("created_at", desc=True).limit(5).execute()
    
    if not response.data:
        # Default empty shape
        return {
            "health_score": 0,
            "asset_count": 0,
            "beneficiary_count": 0,
            "escalation_level": "level_0_normal",
            "last_check_in": None,
            "recent_activity": activity_response.data,
            "onboarding_step": 1
        }
        
    row = response.data[0]
    
    return {
        "health_score": row.get("vault_health_score", 0),
        "asset_count": row.get("active_asset_count", 0),
        "beneficiary_count": row.get("beneficiary_count", 0),
        "escalation_level": row.get("current_escalation_level", "level_0_normal"),
        "last_check_in": row.get("last_check_in_responded_at"),
        "recent_activity": activity_response.data,
        "onboarding_step": 7 # Need to check profiles.onboarding_done 
    }
