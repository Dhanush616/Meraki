from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
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

class GuardianSignupRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
async def guardian_signup(body: GuardianSignupRequest):
    """
    Guardian registers for a full account. 
    Links their auth.users ID to the guardians table.
    """
    import httpx
    # 1. Check if they are actually invited as a guardian
    supabase = get_supabase_client()
    resp = supabase.table("guardians").select("*").eq("email", body.email).execute()
    if not resp.data:
        raise HTTPException(status_code=403, detail="This email is not invited as a guardian. Please contact the vault owner.")
    
    # 2. Register in Supabase Auth
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{os.getenv('SUPABASE_URL')}/auth/v1/signup",
            headers={
                "apikey": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
                "Content-Type": "application/json"
            },
            json={
                "email": body.email,
                "password": body.password
            }
        )
        
        data = response.json()
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=data.get("msg", "Signup failed"))
            
        user_id = data.get("user", {}).get("id")
        
        # 3. Update guardian record with the new user_id
        supabase.table("guardians").update({"user_id": user_id, "status": "active"}).eq("email", body.email).execute()
        
        return {
            "access_token": data.get("access_token"),
            "refresh_token": data.get("refresh_token"),
            "user": data.get("user")
        }

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
        "owner_id": owner_id,
        "owner_first_name": first_name,
        "owner_last_name": last_name,
        "escalation_level": level,
    }


from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form, Depends


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


class ReasonRequest(BaseModel):
    reason: str

@router.post("/provide-reason")
async def provide_reason(body: ReasonRequest, authorization: str | None = Header(default=None)):
    """Guardian provides a reason for owner inactivity. Resets escalation to level 0."""
    payload = _verify_token(authorization)
    guardian_id = payload["sub"]
    owner_id = payload["owner_id"]

    from services.escalation_service import escalate_to
    supabase = get_supabase_client()

    # Reset to Level 0
    await escalate_to(
        supabase, owner_id,
        "level_0_normal",
        f"Guardian provided update: {body.reason}",
        "guardian",
    )

    return {"message": "Escalation reset to Level 0", "new_level": "level_0_normal"}


@router.post("/verify")
async def submit_guardian_death_certificate(
    file: UploadFile = File(...),
    owner_id: Optional[str] = Form(None), # Made optional, we use payload instead
    authorization: str | None = Header(default=None),
):
    """
    Guardian uploads a death certificate.
    Identical pipeline to beneficiary but uses guardian context.
    """
    payload = _verify_token(authorization)
    guardian_id = payload["sub"]
    owner_id_from_token = payload["owner_id"] # Get from JWT for reliability

    from services.verification_service import verify_death_certificate
    from services.notification_service import send_guardian_confirmation
    from core.config import settings
    supabase = get_supabase_client()

    # Mirroring verification_service call but passing None for beneficiary_id
    result = await verify_death_certificate(
        supabase=supabase,
        file_bytes=await file.read(),
        filename=file.filename or "certificate",
        owner_id=str(owner_id_from_token),
        beneficiary_id=None, # Not a beneficiary
        submitted_by_user_id=None, # Guardian portal uses email-based login
    )
    
    if result.get("status") == "verified":
        # Fetch guardian info
        g = supabase.table("guardians").select("email, full_name").eq("id", guardian_id).single().execute()
        # Fetch owner info
        o = supabase.table("profiles").select("full_name").eq("id", str(owner_id_from_token)).single().execute()
        
        owner_name = (o.data or {}).get("full_name", "Owner")
        
        # IMMEDIATELY EXECUTE VAULT (LEVEL 4/5) AS REQUESTED
        from services.execution_service import execute_vault
        
        # 1. Create a vault execution record
        exe_resp = supabase.table("vault_executions").insert({
            "owner_id": str(owner_id_from_token),
            "death_verification_id": result.get("submission_id"),
            "status": "executing"
        }).execute()
        
        if exe_resp.data:
            execution_id = exe_resp.data[0]["id"]
            # 2. Run full execution (this sends emails to beneficiaries)
            await execute_vault(supabase, owner_id_from_token, execution_id, settings.FRONTEND_URL)
            
            # 3. Ensure we are at Level 4 as requested
            from services.escalation_service import escalate_to
            await escalate_to(supabase, str(owner_id_from_token), "level_4_death_claimed", "Death certificate verified by guardian. Beneficiaries notified.", "guardian")
            
            # Update result message for frontend
            result["status"] = "executed" 
            result["message"] = "Level 4 Activated: Certificate Analyzed, Vault Claimed and Beneficiaries Notified."

        if g.data:
            # Still notify guardian
            await send_guardian_confirmation(
                g.data["email"], g.data["full_name"], 
                owner_name.split()[0], 0 
            )
    
    # Log that a guardian submitted it
    supabase.table("activity_logs").insert({
        "owner_id": str(owner_id_from_token),
        "action": "guardian.death_cert_submitted",
        "entity_type": "guardian",
        "entity_id": guardian_id,
    }).execute()
    
    return result
