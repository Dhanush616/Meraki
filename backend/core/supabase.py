from supabase import create_client, Client
from core.config import settings

# Create a singleton supabase client for the backend
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

def get_supabase_client() -> Client:
    """Dependency to get the Supabase client"""
    return supabase