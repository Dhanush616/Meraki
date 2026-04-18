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


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("")
async def list_beneficiaries(user_id: str = Depends(get_current_user_id)):
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

    return beneficiaries


@router.post("")
async def create_beneficiary(
    beneficiary: BeneficiaryCreate,
    user_id: str = Depends(get_current_user_id),
):
    """Create a new beneficiary."""
    supabase = get_supabase_client()
    data = beneficiary.dict()
    data["owner_id"] = user_id
    data["status"] = "registered"
    response = supabase.table("beneficiaries").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create beneficiary")
    return response.data[0]


@router.put("/{beneficiary_id}")
async def update_beneficiary(
    beneficiary_id: UUID,
    beneficiary: BeneficiaryUpdate,
    user_id: str = Depends(get_current_user_id),
):
    """Update an existing beneficiary."""
    supabase = get_supabase_client()
    update_data = {k: v for k, v in beneficiary.dict().items() if v is not None}
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
    return response.data[0]


@router.delete("/{beneficiary_id}")
async def delete_beneficiary(
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
    return {"message": "Beneficiary successfully deleted"}