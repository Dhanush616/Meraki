from fastapi import APIRouter, HTTPException, Header
from core.supabase import get_supabase_client
from core.config import settings

router = APIRouter()

# Simple header-based auth for internal cron endpoints
def _check_internal_key(x_internal_key: str | None = Header(default=None)):
    expected = getattr(settings, "INTERNAL_API_KEY", None) or settings.JWT_SECRET
    if x_internal_key != expected:
        raise HTTPException(status_code=403, detail="Invalid internal API key")


@router.post("/run-checkins")
async def run_checkins(x_internal_key: str | None = Header(default=None)):
    """Daily cron: process check-in scheduler for all active vault owners."""
    _check_internal_key(x_internal_key)
    from services.escalation_service import run_check_in_scheduler
    supabase = get_supabase_client()
    result = await run_check_in_scheduler(supabase, settings.FRONTEND_URL)
    return result


@router.post("/run-liveness-monitor")
async def run_liveness_monitor(x_internal_key: str | None = Header(default=None)):
    """Hourly cron: check liveness windows and execute vaults if expired."""
    _check_internal_key(x_internal_key)
    from services.escalation_service import run_liveness_window_monitor
    supabase = get_supabase_client()
    result = await run_liveness_window_monitor(supabase, settings.FRONTEND_URL)
    return result
