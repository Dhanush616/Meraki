from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from core.supabase import get_supabase_client
from core.security import get_current_user_id

router = APIRouter()

class ProfileUpdate(BaseModel):
    full_name: str
    avatar_url: Optional[str] = None
    date_of_birth: Optional[str] = None
    phone_number: Optional[str] = None
    aadhaar_number: Optional[str] = None
    pan_number: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = "India"
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    spouse_name: Optional[str] = None
    religion: Optional[str] = None

@router.get("/")
def get_profile(user_id: str = Depends(get_current_user_id)):
    client = get_supabase_client()
    
    response = client.table("profiles").select("*").eq("id", user_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    return response.data

@router.put("/")
def update_profile(profile_data: ProfileUpdate, user_id: str = Depends(get_current_user_id)):
    client = get_supabase_client()
    
    # Check current profile for onboarding_step
    current_profile = client.table("profiles").select("onboarding_step").eq("id", user_id).single().execute()
    
    update_dict = profile_data.dict(exclude_unset=True)
    
    # Auto-increment onboarding step if it is 0
    if current_profile.data and current_profile.data.get("onboarding_step", 0) == 0:
        update_dict["onboarding_step"] = 1
        
    response = client.table("profiles").update(update_dict).eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update profile")
        
    return response.data[0]

