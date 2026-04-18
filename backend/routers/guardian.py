from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from jose import jwt, JWTError
from core.supabase import get_supabase_client
import os

router = APIRouter()

_ALGO = "HS256"
_EXPIRE_HOURS = 24


def _create_token(guardian_id: str, owner_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=_EXPIRE_HOURS)
    return jwt.encode(
        {"sub": guardian_id, "owner_id": owner_id, "role": "guardian", "exp": exp},
        os.getenv("JWT_SECRET"), algorithm=_ALGO,
    )


def _verify_token(authorization: str | None) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing guardian token")
    try:
        payload = jwt.decode(
            authorization.removeprefix("Bearer "), os.getenv("JWT_SECRET"), algorithms=[_ALGO]
        )
        if payload.get("role") != "guardian":
            raise HTTPException(status_code=403, detail="Not a guardian token")
        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=str(e))


class GuardianLoginRequest(BaseModel):
    email: str


@router.post("/login")
def guardian_login(body: GuardianLoginRequest):
    """Issue a short-lived guardian token. Email must match an active guardian record."""
    supabase = get_supabase_client()
    resp = supabase.table("guardians").select("*").eq("email", body.email).eq("status", "active").execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="No active guardian account found for this email")
    g = resp.data[0]
    token = _create_token(g["id"], g["owner_id"])
    return {"token": token, "guardian_id": g["id"]}


@router.get("/me")
def guardian_me(authorization: str | None = Header(default=None)):
    """Return guardian context: their name, owner name (first + last only), escalation level."""
    payload = _verify_token(authorization)
    supabase = get_supabase_client()

    guardian = supabase.table("guardians").select("id, full_name").eq("id", payload["sub"]).single().execute()
    owner_id = payload["owner_id"]
    owner = supabase.table("profiles").select("full_name").eq("id", owner_id).single().execute()
    escalation = (
        supabase.table("escalation_settings")
        .select("current_escalation_level")
        .eq("owner_id", owner_id)
        .execute()
    )

    g = guardian.data or {}
    full_name = (owner.data or {}).get("full_name", "")
    parts = full_name.split()
    first_name = parts[0] if parts else ""
    last_name = " ".join(parts[1:]) if len(parts) > 1 else ""
    level = (escalation.data[0] if escalation.data else {}).get("current_escalation_level", "level_0_normal")

    return {
        "guardian_id": g.get("id"),
        "guardian_name": g.get("full_name"),
        "owner_first_name": first_name,
        "owner_last_name": last_name,
        "escalation_level": level,
    }


@router.post("/report")
async def guardian_report(authorization: str | None = Header(default=None)):
    """Guardian reports a suspected death. Escalates owner to level_3."""
    payload = _verify_token(authorization)
    guardian_id = payload["sub"]
    owner_id = payload["owner_id"]

    from services.escalation_service import escalate_to
    supabase = get_supabase_client()

    await escalate_to(
        supabase, owner_id,
        "level_3_suspected_death",
        "Guardian reported suspected death",
        "guardian",
    )

    supabase.table("activity_logs").insert({
        "owner_id": owner_id,
        "action": "guardian.death_reported",
        "entity_type": "guardian",
        "entity_id": guardian_id,
    }).execute()

    return {"escalation_triggered": True, "new_level": "level_3_suspected_death"}
