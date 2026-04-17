from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from core.supabase import get_supabase_client

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

# Mock dependency for getting the current authenticated user's ID
# In reality, this would decode the JWT from the Authorization header
def get_current_user_id():
    # Replace this with actual JWT decoding logic
    return "b6f12bd2-55af-4b8c-8ab5-336e1c66708c" 

@router.get("", response_model=List[AssetResponse])
async def list_assets(user_id: str = Depends(get_current_user_id)):
    """List all assets for the current user."""
    supabase = get_supabase_client()
    response = supabase.table("assets").select("*").eq("owner_id", user_id).neq("status", "inactive").execute()
    return response.data

@router.post("", response_model=AssetResponse)
async def create_asset(asset: AssetCreate, user_id: str = Depends(get_current_user_id)):
    """Create a new asset."""
    supabase = get_supabase_client()
    data = asset.dict()
    data["owner_id"] = user_id
    response = supabase.table("assets").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create asset")
    return response.data[0]

@router.put("/{asset_id}", response_model=AssetResponse)
async def update_asset(asset_id: UUID, asset: AssetUpdate, user_id: str = Depends(get_current_user_id)):
    """Update an existing asset."""
    supabase = get_supabase_client()
    update_data = {k: v for k, v in asset.dict().items() if v is not None}
    response = supabase.table("assets").update(update_data).eq("id", str(asset_id)).eq("owner_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Asset not found or not authorized")
    return response.data[0]

@router.delete("/{asset_id}")
async def delete_asset(asset_id: UUID, user_id: str = Depends(get_current_user_id)):
    """Soft delete an asset by setting status to inactive."""
    supabase = get_supabase_client()
    response = supabase.table("assets").update({"status": "inactive"}).eq("id", str(asset_id)).eq("owner_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Asset not found or not authorized")
    return {"message": "Asset successfully deleted"}
