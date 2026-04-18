from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from core.supabase import get_supabase_client
from core.security import get_current_user_id

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────

class BeneficiaryBase(BaseModel):
    full_name: str
    relationship: str
    email: Optional[str] = None
    phone: Optional[str] = None
    aadhaar: Optional[str] = None
    pan: Optional[str] = None
    address: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None
    crypto_wallet_address: Optional[str] = None
    disclosure_level: str = "partial_awareness"
    is_minor: bool = False
    trustee_id: Optional[str] = None
    personal_message: Optional[str] = None


class BeneficiaryCreate(BeneficiaryBase):
    pass


class BeneficiaryUpdate(BaseModel):
    full_name: Optional[str] = None
    relationship: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    aadhaar: Optional[str] = None
    pan: Optional[str] = None
    address: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None
    crypto_wallet_address: Optional[str] = None
    disclosure_level: Optional[str] = None
    is_minor: Optional[bool] = None
    trustee_id: Optional[str] = None
    personal_message: Optional[str] = None


# ── Helpers ──────────────────────────────────────────────────────────────────

def log_activity(supabase, user_id: str, action: str, entity_type: str, entity_id: str, metadata: dict = None):
    """Helper to log user actions."""
    try:
        supabase.table("activity_logs").insert({
            "owner_id": user_id,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "metadata": metadata or {}
        }).execute()
    except Exception as e:
        print(f"Failed to log activity: {e}")

def _map_from_db_fields(data: dict) -> dict:
    mapped = dict(data)
    mapping = {
        "aadhaar_number": "aadhaar",
        "pan_number": "pan",
        "phone_number": "phone",
        "trustee_beneficiary_id": "trustee_id"
    }
    for db_k, out_k in mapping.items():
        if db_k in mapped:
            mapped[out_k] = mapped.pop(db_k)
    return mapped

def _map_to_db_fields(data: dict) -> dict:
    mapped = {}
    db_mapping = {
        "aadhaar": "aadhaar_number",
        "pan": "pan_number",
        "phone": "phone_number",
        "trustee_id": "trustee_beneficiary_id"
    }
    for k, v in data.items():
        if k in db_mapping:
            mapped[db_mapping[k]] = v
        else:
            mapped[k] = v
    return mapped


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("")
def list_beneficiaries(user_id: str = Depends(get_current_user_id)):
    """List all beneficiaries for the current user."""
    supabase = get_supabase_client()
    response = (
        supabase.table("beneficiaries")
        .select("*")
        .eq("owner_id", user_id)
        .execute()
    )
    beneficiaries = response.data or []

    # Enrich each beneficiary with the count of assets assigned to them
    for bene in beneficiaries:
        mappings = (
            supabase.table("asset_beneficiary_mappings")
            .select("id")
            .eq("beneficiary_id", bene["id"])
            .execute()
        )
        bene["assets_assigned_count"] = len(mappings.data) if mappings.data else 0

    return [_map_from_db_fields(b) for b in beneficiaries]


@router.post("")
def create_beneficiary(
    beneficiary: BeneficiaryCreate,
    user_id: str = Depends(get_current_user_id),
):
    """Create a new beneficiary."""
    supabase = get_supabase_client()
    data = beneficiary.dict()
    
    # ── HACKATHON DEMO LOGIC ──
    # If the beneficiary has an email and is not total_secrecy, we map them an auth account immediately
    # so we can log them in with "Demo@1234" from the beneficiary portal.
    bene_user_id = None
    if data.get("email") and data.get("disclosure_level") != "total_secrecy":
        try:
            # Note: supabase.auth.admin automatically auto-confirms email and bypasses rate limits
            new_user = supabase.auth.admin.create_user({
                "email": data["email"],
                "password": "Demo@1234",
                "email_confirm": True
            })
            bene_user_id = new_user.user.id
            
            # Add to user_roles mapping
            supabase.table("user_roles").insert({
                "user_id": bene_user_id,
                "role": "beneficiary",
                "linked_owner_id": user_id
            }).execute()
        except Exception as e:
            print(f"Warning: Could not auto-create beneficiary auth user: {str(e)}")

    db_data = _map_to_db_fields(data)
    db_data["owner_id"] = user_id
    db_data["user_id"] = bene_user_id  # Link to their Amaanat account
    db_data["status"] = "registered"
    response = supabase.table("beneficiaries").insert(db_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create beneficiary")
    
    new_bene = response.data[0]
    log_activity(supabase, user_id, "beneficiary.created", "beneficiary", new_bene["id"], {"name": new_bene["full_name"], "relation": new_bene["relationship"]})
    
    return _map_from_db_fields(new_bene)


@router.put("/{beneficiary_id}")
def update_beneficiary(
    beneficiary_id: UUID,
    beneficiary: BeneficiaryUpdate,
    user_id: str = Depends(get_current_user_id),
):
    """Update an existing beneficiary."""
    supabase = get_supabase_client()
    update_data = {k: v for k, v in beneficiary.dict().items() if v is not None}
    update_data = _map_to_db_fields(update_data)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    response = (
        supabase.table("beneficiaries")
        .update(update_data)
        .eq("id", str(beneficiary_id))
        .eq("owner_id", user_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(
            status_code=404, detail="Beneficiary not found or not authorized"
        )
    
    updated_bene = response.data[0]
    log_activity(supabase, user_id, "beneficiary.updated", "beneficiary", updated_bene["id"], {"name": updated_bene["full_name"]})
    
    return _map_from_db_fields(updated_bene)


@router.delete("/{beneficiary_id}")
def delete_beneficiary(
    beneficiary_id: UUID,
    user_id: str = Depends(get_current_user_id),
):
    """Soft-delete a beneficiary. Fails if still assigned to any asset."""
    supabase = get_supabase_client()

    # Check for existing asset assignments
    mappings = (
        supabase.table("asset_beneficiary_mappings")
        .select("id")
        .eq("beneficiary_id", str(beneficiary_id))
        .execute()
    )
    if mappings.data and len(mappings.data) > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete: this beneficiary is still assigned to one or more assets. Remove the assignments first.",
        )

    response = (
        supabase.table("beneficiaries")
        .delete()
        .eq("id", str(beneficiary_id))
        .eq("owner_id", user_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(
            status_code=404, detail="Beneficiary not found or not authorized"
        )
    
    log_activity(supabase, user_id, "beneficiary.deleted", "beneficiary", str(beneficiary_id))
    
    return {"message": "Beneficiary successfully deleted"}
