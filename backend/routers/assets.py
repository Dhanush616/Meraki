from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from core.supabase import get_supabase_client
from core.security import get_current_user_id

router = APIRouter()

class AssetBase(BaseModel):
    nickname: str
    asset_type: str
    institution_name: Optional[str] = None
    account_identifier: Optional[str] = None
    estimated_value_inr: Optional[float] = None
    nominee_registered: Optional[bool] = False
    metadata: Optional[Dict[str, Any]] = {}
    status: str = "active"
    primary_total_pct: Optional[float] = 100
    primary_beneficiary_count: Optional[int] = 1
    backup_beneficiary_count: Optional[int] = 0

class BeneficiaryAllocation(BaseModel):
    beneficiary_id: str
    percentage: float
    role: str = "primary"
    priority_order: int = 1
    special_instructions: Optional[str] = None

class AssetCreate(AssetBase):
    primary_total_pct: Optional[float] = 0
    primary_beneficiary_count: Optional[int] = 0
    allocations: Optional[List[BeneficiaryAllocation]] = None

class MappingBase(BaseModel):
    beneficiary_id: UUID
    role: str = "primary"
    percentage: float
    priority_order: int = 1

class MappingResponse(MappingBase):
    id: UUID
    asset_id: UUID

class AssetResponse(AssetBase):
    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime

class AssetUpdate(BaseModel):
    nickname: Optional[str] = None
    asset_type: Optional[str] = None
    institution_name: Optional[str] = None
    account_identifier: Optional[str] = None
    estimated_value_inr: Optional[float] = None
    nominee_registered: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    allocations: Optional[List[BeneficiaryAllocation]] = None

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

@router.get("", response_model=List[AssetResponse])
def list_assets(user_id: str = Depends(get_current_user_id)):
    """List all assets for the current user."""
    supabase = get_supabase_client()
    response = supabase.table("assets").select("*").eq("owner_id", user_id).neq("status", "inactive").execute()
    return response.data

@router.post("", response_model=AssetResponse)
def create_asset(asset: AssetCreate, user_id: str = Depends(get_current_user_id)):
    """Create a new asset."""
    supabase = get_supabase_client()
    data = asset.dict(exclude={"allocations"})
    data["owner_id"] = user_id
    response = supabase.table("assets").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create asset")
    
    new_asset = response.data[0]
    log_activity(supabase, user_id, "asset.created", "asset", str(new_asset["id"]), {"nickname": new_asset["nickname"], "type": new_asset["asset_type"]})
    
    if asset.allocations:
        mappings = []
        for alloc in asset.allocations:
            mappings.append({
                "owner_id": user_id,
                "asset_id": new_asset["id"],
                "beneficiary_id": alloc.beneficiary_id,
                "percentage": alloc.percentage,
                "role": alloc.role,
                "priority_order": alloc.priority_order,
                "special_instructions": alloc.special_instructions
            })
        supabase.table("asset_beneficiary_mappings").insert(mappings).execute()
    
    # Auto-increment onboarding step if it is 1
    current_profile = supabase.table("profiles").select("onboarding_step").eq("id", user_id).single().execute()
    if current_profile.data and current_profile.data.get("onboarding_step", 0) == 1:
        supabase.table("profiles").update({"onboarding_step": 2}).eq("id", user_id).execute()
        
    return new_asset

@router.get("/{asset_id}/mappings", response_model=List[MappingResponse])
def get_asset_mappings(asset_id: UUID, user_id: str = Depends(get_current_user_id)):
    """Get beneficiary mappings for a specific asset."""
    supabase = get_supabase_client()
    response = supabase.table("asset_beneficiary_mappings").select("*").eq("asset_id", str(asset_id)).eq("owner_id", user_id).execute()
    return response.data

@router.put("/{asset_id}/mappings")
def update_asset_mappings(asset_id: UUID, mappings: List[MappingBase], user_id: str = Depends(get_current_user_id)):
    """Update beneficiary mappings for a specific asset."""
    supabase = get_supabase_client()
    
    # 1. Delete existing mappings
    supabase.table("asset_beneficiary_mappings").delete().eq("asset_id", str(asset_id)).eq("owner_id", user_id).execute()
    
    # 2. Insert new mappings
    if mappings:
        new_mappings = []
        total_pct = 0
        primary_count = 0
        backup_count = 0
        
        for m in mappings:
            mapping_data = m.dict()
            mapping_data["beneficiary_id"] = str(mapping_data["beneficiary_id"])
            mapping_data["asset_id"] = str(asset_id)
            mapping_data["owner_id"] = user_id
            new_mappings.append(mapping_data)
            
            if m.role == "primary":
                total_pct += m.percentage
                primary_count += 1
            else:
                backup_count += 1
                
        supabase.table("asset_beneficiary_mappings").insert(new_mappings).execute()
        
        # 3. Update asset summary stats
        supabase.table("assets").update({
            "primary_total_pct": total_pct,
            "primary_beneficiary_count": primary_count,
            "backup_beneficiary_count": backup_count
        }).eq("id", str(asset_id)).eq("owner_id", user_id).execute()
    else:
        # Reset if no mappings
        supabase.table("assets").update({
            "primary_total_pct": 0,
            "primary_beneficiary_count": 0,
            "backup_beneficiary_count": 0
        }).eq("id", str(asset_id)).eq("owner_id", user_id).execute()

    log_activity(supabase, user_id, "asset.mappings_updated", "asset", str(asset_id))
    return {"message": "Mappings updated successfully"}

@router.put("/{asset_id}", response_model=AssetResponse)
def update_asset(asset_id: UUID, asset: AssetUpdate, user_id: str = Depends(get_current_user_id)):
    """Update an existing asset."""
    supabase = get_supabase_client()
    update_data = {k: v for k, v in asset.dict().items() if v is not None}
    response = supabase.table("assets").update(update_data).eq("id", str(asset_id)).eq("owner_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Asset not found or not authorized")
    
    updated_asset = response.data[0]
    log_activity(supabase, user_id, "asset.updated", "asset", str(updated_asset["id"]), {"nickname": updated_asset["nickname"]})
    
    if update_data:
        response = supabase.table("assets").update(update_data).eq("id", str(asset_id)).eq("owner_id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Asset not found or not authorized")
        updated_asset = response.data[0]
        log_activity(supabase, user_id, "asset.updated", "asset", updated_asset["id"], {"nickname": updated_asset["nickname"]})
    else:
        response = supabase.table("assets").select("*").eq("id", str(asset_id)).eq("owner_id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Asset not found or not authorized")
        updated_asset = response.data[0]

    if asset.allocations is not None:
        supabase.table("asset_beneficiary_mappings").delete().eq("asset_id", str(asset_id)).eq("owner_id", user_id).execute()
        if asset.allocations:
            mappings = []
            for alloc in asset.allocations:
                mappings.append({
                    "owner_id": user_id,
                    "asset_id": str(asset_id),
                    "beneficiary_id": alloc.beneficiary_id,
                    "percentage": alloc.percentage,
                    "role": alloc.role,
                    "priority_order": alloc.priority_order,
                    "special_instructions": alloc.special_instructions
                })
            supabase.table("asset_beneficiary_mappings").insert(mappings).execute()
            
            primary_total_pct = sum(a.percentage for a in asset.allocations if a.role == 'primary')
            primary_count = len([a for a in asset.allocations if a.role == 'primary'])
            updated_asset["primary_total_pct"] = primary_total_pct
            updated_asset["primary_beneficiary_count"] = primary_count
            supabase.table("assets").update({"primary_total_pct": primary_total_pct, "primary_beneficiary_count": primary_count}).eq("id", str(asset_id)).execute()
        else:
            updated_asset["primary_total_pct"] = 100
            updated_asset["primary_beneficiary_count"] = 1
            supabase.table("assets").update({"primary_total_pct": 100, "primary_beneficiary_count": 1}).eq("id", str(asset_id)).execute()
            
    return updated_asset

@router.get("/{asset_id}/allocations")
def get_asset_allocations(asset_id: UUID, user_id: str = Depends(get_current_user_id)):
    """Get allocations for a specific asset."""
    supabase = get_supabase_client()
    response = supabase.table("asset_beneficiary_mappings").select("*").eq("asset_id", str(asset_id)).eq("owner_id", user_id).execute()
    return response.data

@router.delete("/{asset_id}")
def delete_asset(asset_id: UUID, user_id: str = Depends(get_current_user_id)):
    """Soft delete an asset by setting status to inactive."""
    supabase = get_supabase_client()
    response = supabase.table("assets").update({"status": "inactive"}).eq("id", str(asset_id)).eq("owner_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Asset not found or not authorized")
    
    log_activity(supabase, user_id, "asset.deleted", "asset", str(asset_id))
    
    return {"message": "Asset successfully deleted"}
