from fastapi import Request, HTTPException, Depends
from core.supabase import get_supabase_client
import httpx
from core.config import settings

async def get_current_user_id(request: Request) -> str:
    """Extracts the JWT token from the headers and verifies it via Supabase."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: No token provided")
    
    token = auth_header.split(" ")[1]
    
    # Verify via Supabase API
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{settings.SUPABASE_URL}/auth/v1/user",
            headers={"apikey": settings.SUPABASE_SERVICE_ROLE_KEY, "Authorization": f"Bearer {token}"}
        )
        if res.status_code != 200:
            raise HTTPException(status_code=401, detail="Unauthorized: Invalid or expired token")
        
        user_data = res.json()
        return user_data.get("id")
