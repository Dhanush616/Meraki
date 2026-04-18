from fastapi import Request, HTTPException, Depends
from core.supabase import get_supabase_client
import httpx
import os

async def get_current_user_id(request: Request) -> str:
    """Extracts the JWT token from the headers and verifies it via Supabase."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: No token provided")
    
    token = auth_header.split(" ")[1]
    
    # Verify via Supabase API
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{os.getenv('SUPABASE_URL')}/auth/v1/user",
            headers={"apikey": os.getenv('SUPABASE_SERVICE_ROLE_KEY'), "Authorization": f"Bearer {token}"}
        )
        if res.status_code != 200:
            raise HTTPException(status_code=401, detail="Unauthorized: Invalid or expired token")
        
        user_data = res.json()
        return user_data.get("id")

async def get_authorized_owner_id(user_id: str) -> str:
    """
    Returns the owner_id that the current user is authorized to view data for.
    - If the user is a vault owner, it returns their own user_id.
    - If the user is a beneficiary or guardian, it returns the linked_owner_id.
    """
    from core.supabase import get_supabase_client
    supabase = get_supabase_client()
    
    # Check if the user is a beneficiary or guardian
    role_res = supabase.table("user_roles").select("linked_owner_id").eq("user_id", user_id).in_("role", ["beneficiary", "guardian"]).execute()
    
    if role_res.data and role_res.data[0].get("linked_owner_id"):
        return role_res.data[0]["linked_owner_id"]
        
    # Default to the user's own ID (assuming they are the owner)
    return user_id
