from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import httpx
from core.config import settings

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict
    temp_session: bool = False # true if 2FA needed

class Verify2FARequest(BaseModel):
    email: str
    token: str

class SignupRequest(BaseModel):
    email: str
    password: str

@router.post("/signup", response_model=LoginResponse)
async def signup(credentials: SignupRequest):
    """
    Register a new user via Supabase Auth API
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.SUPABASE_URL}/auth/v1/signup",
            headers={
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Content-Type": "application/json"
            },
            json={
                "email": credentials.email,
                "password": credentials.password
            }
        )
        
        data = response.json()
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=data.get("msg", "Signup failed")
            )
            
        user_data = data.get("user", {})
        
        return LoginResponse(
            access_token=data.get("access_token", ""),
            refresh_token=data.get("refresh_token", ""),
            user=user_data
        )

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """
    Authenticate user via Supabase Auth API
    """
    # Call Supabase REST Auth API to sign in the user
    # Typically this is handled entirely by the frontend using @supabase/ssr
    # But if the backend requires handling it, we hit the Supabase GOTRUE API
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers={
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Content-Type": "application/json"
            },
            json={
                "email": credentials.email,
                "password": credentials.password
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        data = response.json()
        user_data = data.get("user", {})
        
        # Note: If two_factor_settings checks are needed before issuing tokens,
        # we would query the database here using the service role logic to verify if 2FA is enabled.
        # Supabase also has native MFA which might require passing an MFA token if AAL2 is required. 

        return LoginResponse(
            access_token=data["access_token"],
            refresh_token=data["refresh_token"],
            user=user_data
        )

@router.post("/logout")
async def logout(access_token: str):
    """
    Log out via Supabase Auth API
    """
    async with httpx.AsyncClient() as client:
        await client.post(
            f"{settings.SUPABASE_URL}/auth/v1/logout",
            headers={
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {access_token}"
            }
        )
    return {"message": "Successfully logged out"}


class BeneficiaryLoginRequest(BaseModel):
    email: str

@router.post("/beneficiary-login")
async def beneficiary_login(credentials: BeneficiaryLoginRequest):
    """
    Login a beneficiary using the hardcoded Demo@1234 password.
    Returns their token and beneficiary_id.
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers={
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Content-Type": "application/json"
            },
            json={
                "email": credentials.email,
                "password": "Demo@1234"
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid beneficiary email address.",
            )
            
        data = response.json()
        user_id = data.get("user", {}).get("id")
        access_token = data.get("access_token")

        from core.supabase import get_supabase_client
        supabase = get_supabase_client()
        b_res = supabase.table("beneficiaries").select("id").eq("user_id", user_id).execute()
        if not b_res.data:
            raise HTTPException(status_code=403, detail="No beneficiary record found for this user.")
        
        b_id = b_res.data[0]["id"]
        
        return {
            "token": access_token,
            "beneficiary_id": b_id
        }

from core.security import get_current_user_id

@router.get("/beneficiary-me")
async def get_beneficiary_context(user_id: str = Depends(get_current_user_id)):
    """
    Returns the context for a logged in Beneficiary.
    Varies heavily by disclosure_level.
    """
    from core.supabase import get_supabase_client
    supabase = get_supabase_client()
    
    # 1. Find beneficiary record
    b_res = supabase.table("beneficiaries").select("*").eq("user_id", user_id).execute()
    if not b_res.data:
        raise HTTPException(status_code=403, detail="Beneficiary not found")
        
    bene = b_res.data[0]
    disclosure_level = bene.get("disclosure_level", "total_secrecy")
    owner_id = bene.get("owner_id")
    
    # 2. Get Vault Owner's Name
    owner_name = "the owner"
    prof_res = supabase.table("profiles").select("full_name").eq("id", owner_id).execute()
    if prof_res.data:
        owner_name = prof_res.data[0].get("full_name", owner_name)
    
    response_data = {
        "beneficiary_name": bene.get("full_name"),
        "disclosure_level": disclosure_level,
        "owner_name": owner_name,
        "status": bene.get("status")
    }
    
    # If full_transparency, return assigned assets
    if disclosure_level == "full_transparency":
        mappings_res = supabase.table("asset_beneficiary_mappings").select("percentage, assets(nickname, asset_type)").eq("beneficiary_id", bene["id"]).execute()
        allocated_assets = []
        if mappings_res.data:
            for m in mappings_res.data:
                # Handle Supabase embedded JSON joins
                asset = m.get("assets")
                if asset:
                    allocated_assets.append({
                        "nickname": asset.get("nickname"),
                        "asset_type": asset.get("asset_type"),
                        "percentage": m.get("percentage")
                    })
        response_data["allocated_assets"] = allocated_assets
        
    return response_data

