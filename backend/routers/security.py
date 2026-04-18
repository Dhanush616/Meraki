from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
import httpx
import json
import io
import base64
import secrets
import hmac
import hashlib
import struct
import time
import qrcode
from datetime import datetime, timezone
from cryptography.fernet import Fernet
from core.supabase import get_supabase_client
from core.security import get_current_user_id
from core.config import settings

router = APIRouter()


def _fernet_key() -> bytes:
    raw = settings.ENCRYPTION_MASTER_KEY.encode()
    digest = hashlib.sha256(raw).digest()
    return base64.urlsafe_b64encode(digest)


def _generate_totp_secret() -> str:
    return base64.b32encode(secrets.token_bytes(20)).decode()


def _verify_totp(secret: str, code: str, window: int = 1) -> bool:
    try:
        key = base64.b32decode(secret.upper())
        T = int(time.time()) // 30
        for offset in range(-window, window + 1):
            msg = struct.pack(">Q", T + offset)
            h = hmac.new(key, msg, hashlib.sha1).digest()
            o = h[-1] & 0xF
            otp = (struct.unpack(">I", h[o:o + 4])[0] & 0x7FFFFFFF) % 1_000_000
            if str(otp).zfill(6) == code.strip():
                return True
        return False
    except Exception:
        return False


# ── Sessions ─────────────────────────────────────────────────────────────────

@router.get("/sessions")
def list_sessions(request: Request, user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()
    resp = (
        supabase.table("login_sessions")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .order("last_active_at", desc=True)
        .execute()
    )
    current_ua = request.headers.get("user-agent", "")
    sessions = resp.data or []
    for s in sessions:
        s["is_current"] = s.get("user_agent", "") == current_ua
    return sessions


@router.delete("/sessions/{session_id}")
def revoke_session(session_id: UUID, user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()
    resp = (
        supabase.table("login_sessions")
        .update({"is_active": False, "revoked_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", str(session_id))
        .eq("user_id", user_id)
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session revoked"}


# ── Password ──────────────────────────────────────────────────────────────────

class PasswordChangeRequest(BaseModel):
    new_password: str


@router.post("/password")
async def change_password(
    body: PasswordChangeRequest,
    request: Request,
    user_id: str = Depends(get_current_user_id),
):
    token = request.headers.get("Authorization", "").removeprefix("Bearer ")
    async with httpx.AsyncClient() as client:
        res = await client.put(
            f"{settings.SUPABASE_URL}/auth/v1/user",
            headers={
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json={"password": body.new_password},
        )
    if res.status_code != 200:
        raise HTTPException(status_code=400, detail=res.json().get("msg", "Failed to change password"))
    return {"message": "Password changed successfully"}


# ── 2FA ───────────────────────────────────────────────────────────────────────

@router.get("/2fa")
def get_2fa(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()
    resp = (
        supabase.table("two_factor_settings")
        .select("email_otp_enabled, sms_otp_enabled, totp_enabled, preferred_method")
        .eq("user_id", user_id)
        .execute()
    )
    if not resp.data:
        return {"email_otp_enabled": False, "sms_otp_enabled": False, "totp_enabled": False, "preferred_method": None}
    return resp.data[0]


class Toggle2FARequest(BaseModel):
    method: str   # "email_otp" | "sms_otp"
    enabled: bool


@router.post("/2fa/toggle")
def toggle_2fa(body: Toggle2FARequest, user_id: str = Depends(get_current_user_id)):
    if body.method not in ("email_otp", "sms_otp"):
        raise HTTPException(status_code=400, detail="Invalid method")
    field = f"{body.method}_enabled"
    supabase = get_supabase_client()
    existing = supabase.table("two_factor_settings").select("id").eq("user_id", user_id).execute()
    if existing.data:
        supabase.table("two_factor_settings").update({field: body.enabled}).eq("user_id", user_id).execute()
    else:
        supabase.table("two_factor_settings").insert({"user_id": user_id, field: body.enabled}).execute()
    return {"message": "Updated"}


@router.get("/2fa/totp/setup")
def totp_setup(user_id: str = Depends(get_current_user_id)):
    secret = _generate_totp_secret()
    label = f"Amaanat:{user_id[:8]}"
    uri = f"otpauth://totp/{label}?secret={secret}&issuer=Amaanat&algorithm=SHA1&digits=6&period=30"
    img = qrcode.make(uri)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    qr_b64 = base64.b64encode(buf.read()).decode()
    return {"secret": secret, "qr_code": f"data:image/png;base64,{qr_b64}"}


class TOTPEnableRequest(BaseModel):
    secret: str
    code: str


@router.post("/2fa/totp/enable")
def totp_enable(body: TOTPEnableRequest, user_id: str = Depends(get_current_user_id)):
    if not _verify_totp(body.secret, body.code):
        raise HTTPException(status_code=400, detail="Invalid code — try again")
    supabase = get_supabase_client()
    existing = supabase.table("two_factor_settings").select("id").eq("user_id", user_id).execute()
    update = {"totp_enabled": True, "totp_secret": body.secret}
    if existing.data:
        supabase.table("two_factor_settings").update(update).eq("user_id", user_id).execute()
    else:
        supabase.table("two_factor_settings").insert({"user_id": user_id, **update}).execute()
    return {"message": "TOTP enabled"}


@router.post("/2fa/totp/disable")
def totp_disable(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()
    supabase.table("two_factor_settings").update({"totp_enabled": False, "totp_secret": None}).eq("user_id", user_id).execute()
    return {"message": "TOTP disabled"}


# ── Vault Export ──────────────────────────────────────────────────────────────

@router.get("/vault-export")
def vault_export(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()
    assets_data       = (supabase.table("assets").select("*").eq("owner_id", user_id).execute()).data or []
    beneficiaries_data = (supabase.table("beneficiaries").select("*").eq("owner_id", user_id).execute()).data or []
    profile_data      = (supabase.table("profiles").select("id, full_name, city, state, country, created_at").eq("id", user_id).single().execute()).data or {}
    will_data         = (supabase.table("will_documents").select("*").eq("owner_id", user_id).execute()).data or []

    payload = json.dumps(
        {
            "export_version": "1.0",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "owner": profile_data,
            "assets": assets_data,
            "beneficiaries": beneficiaries_data,
            "will_documents": will_data,
        },
        default=str,
    ).encode()

    encrypted = Fernet(_fernet_key()).encrypt(payload)
    return StreamingResponse(
        io.BytesIO(encrypted),
        media_type="application/octet-stream",
        headers={"Content-Disposition": "attachment; filename=vault.vault"},
    )


# ── Delete Account ────────────────────────────────────────────────────────────

@router.delete("/account")
async def delete_account(user_id: str = Depends(get_current_user_id)):
    async with httpx.AsyncClient() as client:
        res = await client.delete(
            f"{settings.SUPABASE_URL}/auth/v1/admin/users/{user_id}",
            headers={
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            },
        )
    if res.status_code not in (200, 204):
        raise HTTPException(status_code=400, detail="Failed to delete account")
    return {"message": "Account deleted"}
