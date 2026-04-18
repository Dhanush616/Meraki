from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Optional
from core.supabase import get_supabase_client
from core.security import get_current_user_id

router = APIRouter()

# Allowed MIME types for death certificate upload
ALLOWED_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/webp"}
MAX_SIZE_MB = 10


@router.post("/submit")
async def submit_death_certificate(
    file: UploadFile = File(...),
    owner_id: str = Form(...),
    beneficiary_id: str = Form(...),
    user_id: str = Depends(get_current_user_id),
):
    """
    Beneficiary uploads a death certificate.
    Triggers: upload → QR extraction (simulated) → name match → liveness window.
    """
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF or image files are accepted")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File must be under {MAX_SIZE_MB} MB")

    from services.verification_service import verify_death_certificate
    supabase = get_supabase_client()

    result = await verify_death_certificate(
        supabase=supabase,
        file_bytes=file_bytes,
        filename=file.filename or "certificate",
        owner_id=owner_id,
        beneficiary_id=beneficiary_id,
        submitted_by_user_id=user_id,
    )
    return result


@router.get("/status/{owner_id}")
async def get_verification_status(owner_id: str, user_id: str = Depends(get_current_user_id)):
    """Return the latest death verification submission for an owner."""
    supabase = get_supabase_client()
    resp = (
        supabase.table("death_verification_submissions")
        .select("id, verification_status, liveness_window_end, liveness_challenge_responded, created_at")
        .eq("owner_id", owner_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    return resp.data[0] if resp.data else None
