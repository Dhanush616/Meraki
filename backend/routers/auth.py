from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import httpx
import os

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
            f"{os.getenv("SUPABASE_URL")}/auth/v1/signup",
            headers={
                "apikey": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
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
            f"{os.getenv("SUPABASE_URL")}/auth/v1/token?grant_type=password",
            headers={
                "apikey": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
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
            f"{os.getenv("SUPABASE_URL")}/auth/v1/logout",
            headers={
                "apikey": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
                "Authorization": f"Bearer {access_token}"
            }
        )
    return {"message": "Successfully logged out"}
