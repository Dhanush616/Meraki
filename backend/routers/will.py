"""
will.py — FastAPI router for will document generation and signing status.

Endpoints:
    GET  /api/documents/will/current          → fetch current will for user
    POST /api/documents/will/generate         → generate new will PDF & store in Supabase
    PUT  /api/documents/will/{id}/signing-status  → update signing checklist state
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import io
import uuid
import logging
from datetime import datetime, timezone, timedelta

from core.supabase import get_supabase_client
from core.security import get_current_user_id

router = APIRouter()
logger = logging.getLogger(__name__)

BUCKET = "generated-documents"
SIGNED_URL_EXPIRY = 3600  # 60 min


# ── Pydantic models ──────────────────────────────────────────────────────────

class WillGenerateRequest(BaseModel):
    executor_name: Optional[str] = ""
    special_instructions: Optional[str] = ""


class SigningStatusRequest(BaseModel):
    is_printed: bool = False
    is_signed: bool = False
    is_witnessed: bool = False
    witness_1_name: Optional[str] = ""
    witness_2_name: Optional[str] = ""


# ── Helpers ──────────────────────────────────────────────────────────────────

def _get_or_create_signed_url(supabase, storage_path: str) -> str:
    """Get a fresh signed URL for a file in Supabase Storage."""
    try:
        result = supabase.storage.from_(BUCKET).create_signed_url(
            storage_path, SIGNED_URL_EXPIRY
        )
        return result.get("signedURL") or result.get("signedUrl") or ""
    except Exception as exc:
        logger.warning(f"Could not generate signed URL for {storage_path}: {exc}")
        return ""


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/current")
async def get_current_will(user_id: str = Depends(get_current_user_id)):
    """Return the current (is_current=True) will document row for the user."""
    supabase = get_supabase_client()

    resp = (
        supabase.table("will_documents")
        .select("*")
        .eq("owner_id", user_id)
        .eq("is_current", True)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not resp.data:
        return {"will_id": None}

    row = resp.data[0]
    signed_url = _get_or_create_signed_url(supabase, row.get("storage_path", ""))

    return {
        "will_id":      row["id"],
        "version":      row.get("version", 1),
        "storage_path": row.get("storage_path"),
        "signed_url":   signed_url,
        "is_signed":    row.get("is_signed", False),
        "is_witnessed": row.get("is_witnessed", False),
        "is_printed":   row.get("is_printed", False),
        "witness_1_name": row.get("witness_1_name", ""),
        "witness_2_name": row.get("witness_2_name", ""),
        "executor_name":  row.get("executor_name", ""),
        "special_instructions": row.get("special_instructions", ""),
        "trigger_event": row.get("trigger_event"),
        "created_at":   row.get("created_at"),
    }


@router.get("/history")
async def get_will_history(user_id: str = Depends(get_current_user_id)):
    """Return all will versions for the user (newest first)."""
    supabase = get_supabase_client()

    resp = (
        supabase.table("will_documents")
        .select("id, version, created_at, is_current, trigger_event, storage_path, is_signed, is_witnessed")
        .eq("owner_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    rows = resp.data or []
    # Attach fresh signed URLs for each row
    for row in rows:
        row["signed_url"] = _get_or_create_signed_url(supabase, row.get("storage_path", ""))

    return rows


@router.post("/generate")
async def generate_will(
    body: WillGenerateRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Generate a new will PDF for the authenticated user.
    Steps:
      1. Fetch assets + beneficiary mappings
      2. Fetch user profile
      3. Render PDF with will_template
      4. Upload to Supabase Storage
      5. Update will_documents table (version bump, mark previous non-current)
    """
    from services.will_template import generate_will_pdf

    supabase = get_supabase_client()

    # 1. Fetch data
    assets_resp = (
        supabase.table("assets")
        .select("*")
        .eq("owner_id", user_id)
        .eq("status", "active")
        .execute()
    )
    assets = assets_resp.data or []

    mappings_resp = (
        supabase.table("asset_beneficiary_mappings")
        .select("*")
        .in_("asset_id", [str(a["id"]) for a in assets] or ["none"])
        .execute()
    )
    mappings = mappings_resp.data or []

    bene_resp = (
        supabase.table("beneficiaries")
        .select("*")
        .eq("owner_id", user_id)
        .execute()
    )
    beneficiaries = bene_resp.data or []

    # 2. Profile
    profile_resp = (
        supabase.table("profiles")
        .select("*")
        .eq("id", user_id)
        .single()
        .execute()
    )
    profile = profile_resp.data or {}

    # 3. Generate PDF
    try:
        pdf_bytes = generate_will_pdf(
            profile=profile,
            assets=assets,
            mappings=mappings,
            beneficiaries=beneficiaries,
            executor_name=body.executor_name or "",
            special_instructions=body.special_instructions or "",
        )
    except Exception as exc:
        logger.error(f"Will PDF generation failed: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(exc)}")

    # 4. Determine next version number
    existing_resp = (
        supabase.table("will_documents")
        .select("version")
        .eq("owner_id", user_id)
        .order("version", desc=True)
        .limit(1)
        .execute()
    )
    last_version = (existing_resp.data or [{}])[0].get("version", 0)
    new_version  = int(last_version) + 1

    # 5. Upload PDF to storage
    storage_path = f"{user_id}/will_v{new_version}_{uuid.uuid4().hex[:8]}.pdf"
    try:
        supabase.storage.from_(BUCKET).upload(
            storage_path,
            pdf_bytes,
            {"content-type": "application/pdf", "upsert": "false"},
        )
    except Exception as exc:
        logger.error(f"Storage upload failed: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Storage upload failed: {str(exc)}")

    # 6. Mark old versions as not current
    supabase.table("will_documents").update({"is_current": False}).eq("owner_id", user_id).execute()

    # 7. Insert new will_documents row
    row_data = {
        "id":                   str(uuid.uuid4()),
        "owner_id":             user_id,
        "version":              new_version,
        "storage_path":         storage_path,
        "is_current":           True,
        "is_signed":            False,
        "is_witnessed":         False,
        "is_printed":           False,
        "executor_name":        body.executor_name or "",
        "special_instructions": body.special_instructions or "",
        "trigger_event":        "manual_generate",
        "created_at":           datetime.now(timezone.utc).isoformat(),
    }
    insert_resp = supabase.table("will_documents").insert(row_data).execute()
    if not insert_resp.data:
        raise HTTPException(status_code=500, detail="Failed to create will_documents record")

    new_row    = insert_resp.data[0]
    signed_url = _get_or_create_signed_url(supabase, storage_path)

    return {
        "will_id":      new_row["id"],
        "version":      new_version,
        "storage_path": storage_path,
        "signed_url":   signed_url,
    }


@router.get("/{will_id}/download")
async def download_will_pdf(
    will_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Stream the will PDF directly from Supabase Storage."""
    supabase = get_supabase_client()

    row_resp = (
        supabase.table("will_documents")
        .select("storage_path")
        .eq("id", will_id)
        .eq("owner_id", user_id)
        .single()
        .execute()
    )
    if not row_resp.data:
        raise HTTPException(status_code=404, detail="Will document not found")

    storage_path = row_resp.data["storage_path"]
    try:
        pdf_bytes = supabase.storage.from_(BUCKET).download(storage_path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(exc)}")

    filename = f"will_v{will_id[:8]}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.put("/{will_id}/signing-status")
async def update_signing_status(
    will_id: str,
    body: SigningStatusRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Update the signing checklist for a will document."""
    supabase = get_supabase_client()

    update_data = {
        "is_printed":     body.is_printed,
        "is_signed":      body.is_signed,
        "is_witnessed":   body.is_witnessed,
        "witness_1_name": body.witness_1_name or "",
        "witness_2_name": body.witness_2_name or "",
    }

    resp = (
        supabase.table("will_documents")
        .update(update_data)
        .eq("id", will_id)
        .eq("owner_id", user_id)
        .execute()
    )

    if not resp.data:
        raise HTTPException(status_code=404, detail="Will document not found or not authorized")

    return {"updated": True}
