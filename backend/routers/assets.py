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

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    nickname: Optional[str] = None
    asset_type: Optional[str] = None
    institution_name: Optional[str] = None
    account_identifier: Optional[str] = None
    estimated_value_inr: Optional[float] = None
    nominee_registered: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class AssetResponse(AssetBase):
    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime

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
    data = asset.dict()
    data["owner_id"] = user_id
    response = supabase.table("assets").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create asset")
    
    new_asset = response.data[0]
    log_activity(supabase, user_id, "asset.created", "asset", new_asset["id"], {"nickname": new_asset["nickname"], "type": new_asset["asset_type"]})
    
    return new_asset

@router.put("/{asset_id}", response_model=AssetResponse)
def update_asset(asset_id: UUID, asset: AssetUpdate, user_id: str = Depends(get_current_user_id)):
    """Update an existing asset."""
    supabase = get_supabase_client()
    update_data = {k: v for k, v in asset.dict().items() if v is not None}
    response = supabase.table("assets").update(update_data).eq("id", str(asset_id)).eq("owner_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Asset not found or not authorized")
    
    updated_asset = response.data[0]
    log_activity(supabase, user_id, "asset.updated", "asset", updated_asset["id"], {"nickname": updated_asset["nickname"]})
    
    return updated_asset

@router.delete("/{asset_id}")
def delete_asset(asset_id: UUID, user_id: str = Depends(get_current_user_id)):
    """Soft delete an asset by setting status to inactive."""
    supabase = get_supabase_client()
    response = supabase.table("assets").update({"status": "inactive"}).eq("id", str(asset_id)).eq("owner_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Asset not found or not authorized")
    
    log_activity(supabase, user_id, "asset.deleted", "asset", str(asset_id))
    
    return {"message": "Asset successfully deleted"}
