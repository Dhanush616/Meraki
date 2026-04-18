from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from collections import defaultdict
from core.supabase import get_supabase_client
from core.security import get_current_user_id

import concurrent.futures

router = APIRouter()

@router.get("/summary", response_model=Dict[str, Any])
def get_vault_summary(user_id: str = Depends(get_current_user_id)):
    """Get the dashboard summary for the overview page."""
    supabase = get_supabase_client()

    # Offload sequential queries to a ThreadPool to make them run in parallel
    queries = [
        lambda: supabase.table("vault_summary").select("*").eq("owner_id", user_id).execute(),
        lambda: supabase.table("activity_logs").select("*").eq("owner_id", user_id).order("created_at", desc=True).limit(5).execute(),
        lambda: supabase.table("profiles").select("onboarding_step, onboarding_done").eq("id", user_id).single().execute(),
        lambda: supabase.table("assets").select("asset_type, estimated_value_inr").eq("owner_id", user_id).eq("status", "active").execute(),
        lambda: supabase.table("escalation_settings").select("check_in_frequency_days").eq("owner_id", user_id).single().execute(),
    ]
    
    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = list(executor.map(lambda q: q(), queries))

    (
        summary_response,
        activity_response,
        profile_response,
        assets_response,
        escalation_response,
    ) = results

    profile = profile_response.data or {}
    onboarding_step = profile.get("onboarding_step", 0)
    onboarding_done = profile.get("onboarding_done", False)

    # Group assets by type
    type_totals: dict = defaultdict(lambda: {"count": 0, "total_value": 0.0})
    for asset in (assets_response.data or []):
        t = asset["asset_type"]
        type_totals[t]["count"] += 1
        type_totals[t]["total_value"] += float(asset.get("estimated_value_inr") or 0)
    assets_by_type: List[Dict] = [
        {"asset_type": k, "count": v["count"], "total_value": v["total_value"]}
        for k, v in type_totals.items()
    ]

    check_in_frequency_days = (escalation_response.data or {}).get("check_in_frequency_days", 90)

    if not summary_response.data:
        return {
            "health_score": 0,
            "asset_count": 0,
            "beneficiary_count": 0,
            "escalation_level": "level_0_normal",
            "last_check_in": None,
            "recent_activity": activity_response.data or [],
            "onboarding_step": onboarding_step,
            "onboarding_done": onboarding_done,
            "assets_by_type": assets_by_type,
            "check_in_frequency_days": check_in_frequency_days,
        }

    row = summary_response.data[0]

    return {
        "health_score": row.get("vault_health_score", 0),
        "asset_count": row.get("active_asset_count", 0),
        "beneficiary_count": row.get("beneficiary_count", 0),
        "escalation_level": row.get("current_escalation_level", "level_0_normal"),
        "last_check_in": row.get("last_check_in_responded_at"),
        "recent_activity": activity_response.data or [],
        "onboarding_step": onboarding_step,
        "onboarding_done": onboarding_done,
        "assets_by_type": assets_by_type,
        "check_in_frequency_days": check_in_frequency_days,
    }
