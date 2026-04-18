import uuid
import io
import logging
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)

# Supabase Storage bucket names
CERT_BUCKET = "death-certificates"


async def upload_certificate(supabase, file_bytes: bytes, filename: str, owner_id: str) -> str:
    """Upload death certificate to Supabase Storage. Returns the storage path."""
    path = f"{owner_id}/{uuid.uuid4()}/{filename}"
    supabase.storage.from_(CERT_BUCKET).upload(path, file_bytes, {"content-type": "application/octet-stream"})
    return path


def extract_cert_metadata(file_bytes: bytes, filename: str) -> dict:
    """
    Demo: simulate certificate extraction.
    Production: use OCR/QR scanning on the PDF/image.
    """
    return {
        "registration_number": f"CRS/{datetime.now().year}/DEMO/{uuid.uuid4().hex[:8].upper()}",
        "name_on_document": None,   # populated later via name-match check
        "date_of_death": None,
        "place_of_death": "India",
        "issuing_authority": "Municipal Corporation",
        "qr_verification_url": "https://crs.gov.in/verify/demo",
        "qr_verified": True,        # simulated: QR always valid in demo
    }


async def verify_death_certificate(
    supabase,
    file_bytes: bytes,
    filename: str,
    owner_id: str,
    beneficiary_id: str,
    submitted_by_user_id: str,
) -> dict:
    """
    Full death certificate verification pipeline.
    Returns the created submission record.
    """
    from services.notification_service import send_liveness_challenge

    # 1. Upload file
    try:
        storage_path = await upload_certificate(supabase, file_bytes, filename, owner_id)
    except Exception as e:
        logger.warning(f"Storage upload failed (demo mode — continuing): {e}")
        storage_path = f"{owner_id}/demo/{filename}"

    # 2. Extract metadata (simulated)
    meta = extract_cert_metadata(file_bytes, filename)

    # 3. Check name match against vault owner profile
    profile = supabase.table("profiles").select("full_name").eq("id", owner_id).single().execute()
    owner_name = (profile.data or {}).get("full_name", "")
    name_match = bool(owner_name)  # demo: always match if owner profile exists
    meta["name_on_document"] = owner_name
    meta["name_match"] = name_match

    verification_status = "verified" if (meta["qr_verified"] and name_match) else "rejected"
    rejection_reason = None if verification_status == "verified" else "Name or QR code could not be verified"

    # 4. Create submission record
    now = datetime.now(timezone.utc)
    liveness_end = (now + timedelta(days=15)).isoformat() if verification_status == "verified" else None

    liveness_token = str(uuid.uuid4()) if verification_status == "verified" else None

    submission = supabase.table("death_verification_submissions").insert({
        "owner_id": owner_id,
        "submitted_by_beneficiary_id": beneficiary_id,
        "submitted_by_user_id": submitted_by_user_id,
        "certificate_storage_path": storage_path,
        "cert_registration_number": meta["registration_number"],
        "cert_name_on_document": meta["name_on_document"],
        "cert_date_of_death": meta.get("date_of_death"),
        "cert_place_of_death": meta["place_of_death"],
        "cert_issuing_authority": meta["issuing_authority"],
        "cert_qr_verification_url": meta["qr_verification_url"],
        "cert_qr_verified": meta["qr_verified"],
        "cert_name_match": name_match,
        "verification_status": verification_status,
        "verified_at": now.isoformat() if verification_status == "verified" else None,
        "verified_by": "system_auto",
        "rejection_reason": rejection_reason,
        "liveness_window_start": now.isoformat() if verification_status == "verified" else None,
        "liveness_window_end": liveness_end,
        "liveness_token": liveness_token,
    }).execute()

    submission_row = submission.data[0] if submission.data else {}

    if verification_status == "verified":
        # 5. Create vault_executions row
        supabase.table("vault_executions").insert({
            "owner_id": owner_id,
            "death_verification_id": submission_row.get("id"),
            "status": "liveness_window_open",
        }).execute()

        # 6. Update escalation to level_4_death_claimed
        from services.escalation_service import escalate_to
        await escalate_to(supabase, owner_id, "level_4_death_claimed",
                          "Death certificate submitted and verified", "beneficiary")

        # 7. Send liveness challenge to owner (demo: log only)
        logger.info(f"🚨 Liveness challenge token for owner {owner_id}: {liveness_token}")
        # await send_liveness_challenge(owner_email, owner_name, liveness_token, frontend_url)

        # 8. Log activity
        supabase.table("activity_logs").insert({
            "owner_id": owner_id,
            "action": "death_certificate.submitted",
            "entity_type": "verification",
            "entity_id": submission_row.get("id"),
        }).execute()

    return {
        "submission_id": submission_row.get("id"),
        "status": verification_status,
        "verification_result": {
            "qr_verified": meta["qr_verified"],
            "name_match": name_match,
            "registration_number": meta["registration_number"],
        },
        "rejection_reason": rejection_reason,
        "liveness_window_days": 15 if verification_status == "verified" else None,
    }
