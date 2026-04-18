import uuid
import logging
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)


async def escalate_to(supabase, owner_id: str, new_level: str, reason: str, triggered_by: str = "system"):
    """Update escalation level and write to escalation_log + activity_logs."""
    current = supabase.table("escalation_settings").select("current_escalation_level").eq("owner_id", owner_id).execute()
    from_level = (current.data[0]["current_escalation_level"] if current.data else "level_0_normal")

    now = datetime.now(timezone.utc).isoformat()
    supabase.table("escalation_settings").update({
        "current_escalation_level": new_level,
        "escalation_started_at": now,
        "updated_at": now,
    }).eq("owner_id", owner_id).execute()

    supabase.table("escalation_log").insert({
        "owner_id": owner_id,
        "from_level": from_level,
        "to_level": new_level,
        "reason": reason,
        "triggered_by": triggered_by,
    }).execute()

    supabase.table("activity_logs").insert({
        "owner_id": owner_id,
        "action": "escalation.changed",
        "entity_type": "escalation",
        "metadata": {"from": from_level, "to": new_level, "reason": reason},
    }).execute()

    logger.info(f"Escalated {owner_id}: {from_level} → {new_level}")
    return from_level


async def send_check_in(supabase, owner_id: str, owner_email: str, owner_name: str,
                        current_level: str, frontend_url: str) -> str:
    """Create check_in_events row and send email. Returns the response token."""
    from services.notification_service import send_check_in_email

    token = str(uuid.uuid4())
    expires = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()

    supabase.table("check_in_events").insert({
        "owner_id": owner_id,
        "escalation_level_at_time": current_level,
        "channel": "email",
        "status": "sent",
        "response_token": token,
        "response_token_expires_at": expires,
    }).execute()

    await send_check_in_email(owner_email, owner_name, token, frontend_url)
    logger.info(f"Check-in sent to owner {owner_id}")
    return token


async def respond_to_check_in(supabase, token: str) -> dict:
    """Mark a check-in as responded. Called when owner clicks the email link."""
    now = datetime.now(timezone.utc).isoformat()
    resp = supabase.table("check_in_events").update({
        "status": "responded",
        "responded_at": now,
    }).eq("response_token", token).gt("response_token_expires_at", now).execute()

    if not resp.data:
        return {"success": False, "reason": "Token invalid or expired"}

    owner_id = resp.data[0]["owner_id"]

    # Reset escalation to normal and update last check-in
    await escalate_to(supabase, owner_id, "level_0_normal", "Owner responded to check-in", "system")
    supabase.table("escalation_settings").update({
        "last_check_in_responded_at": now,
    }).eq("owner_id", owner_id).execute()

    return {"success": True, "owner_id": owner_id}


async def run_check_in_scheduler(supabase, frontend_url: str) -> dict:
    """
    Daily job: for each active vault owner, check inactivity and send check-ins or escalate.
    Returns a summary of actions taken.
    """
    results = supabase.table("escalation_settings").select(
        "owner_id, current_escalation_level, vacation_mode_active, "
        "check_in_frequency_days, last_check_in_responded_at, last_login_detected_at, "
        "inactivity_threshold_days"
    ).not_.eq("current_escalation_level", "level_5_executed").execute()

    actions_taken = []

    for row in (results.data or []):
        if row.get("vacation_mode_active"):
            continue

        owner_id = row["owner_id"]
        frequency = row.get("check_in_frequency_days") or 90
        threshold = row.get("inactivity_threshold_days") or 90
        reference = row.get("last_check_in_responded_at") or row.get("last_login_detected_at")

        if not reference:
            continue

        try:
            last_active = datetime.fromisoformat(reference.replace("Z", "+00:00"))
        except Exception:
            continue

        days_silent = (datetime.now(timezone.utc) - last_active).days

        if days_silent < frequency:
            continue

        current_level = row.get("current_escalation_level", "level_0_normal")

        # Get profile for name
        profile = supabase.table("profiles").select("full_name").eq("id", owner_id).single().execute()
        owner_name = (profile.data or {}).get("full_name", "Vault Owner")

        if days_silent >= threshold * 2 and current_level in ("level_0_normal", "level_1_concern"):
            # Double threshold exceeded → escalate
            next_level = "level_2_alert" if current_level == "level_1_concern" else "level_1_concern"
            await escalate_to(supabase, owner_id, next_level, "Inactivity threshold exceeded", "system")
            actions_taken.append({"owner_id": owner_id, "action": f"escalated_to_{next_level}"})
        else:
            # Send check-in (email lookup skipped in demo — log only)
            logger.info(f"Check-in required for {owner_id} — {days_silent} days silent")
            actions_taken.append({"owner_id": owner_id, "action": "check_in_logged"})

    return {"processed": len(results.data or []), "actions": actions_taken}


async def run_liveness_window_monitor(supabase, frontend_url: str) -> dict:
    """
    Hourly job: check liveness_window_open executions.
    Expire → execute vault. Responded → cancel.
    """
    from services.execution_service import execute_vault

    now = datetime.now(timezone.utc)
    open_executions = supabase.table("vault_executions").select("*").eq("status", "liveness_window_open").execute()

    results = []
    for exe in (open_executions.data or []):
        # Check the corresponding verification submission for liveness status
        verification = supabase.table("death_verification_submissions").select(
            "liveness_window_end, liveness_challenge_responded"
        ).eq("id", exe["death_verification_id"]).single().execute()

        if not verification.data:
            continue

        ver = verification.data
        window_end_str = ver.get("liveness_window_end")
        responded = ver.get("liveness_challenge_responded", False)

        if responded:
            # Cancel — owner is alive
            supabase.table("vault_executions").update({"status": "cancelled"}).eq("id", exe["id"]).execute()
            await escalate_to(supabase, exe["owner_id"], "level_0_normal", "Liveness confirmed by owner", "system")
            results.append({"execution_id": exe["id"], "action": "cancelled"})

        elif window_end_str:
            try:
                window_end = datetime.fromisoformat(window_end_str.replace("Z", "+00:00"))
            except Exception:
                continue

            if now > window_end:
                # Window expired, no response → execute vault
                supabase.table("vault_executions").update({"status": "executing"}).eq("id", exe["id"]).execute()
                await execute_vault(supabase, exe["owner_id"], exe["id"], frontend_url)
                results.append({"execution_id": exe["id"], "action": "executed"})

    return {"checked": len(open_executions.data or []), "results": results}
