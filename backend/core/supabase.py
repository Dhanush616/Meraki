import os
from supabase import create_client, Client

# Create a singleton supabase client for the backend
supabase: Client = create_client(os.getenv("SUPABASE_URL", ""), os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""))

def get_supabase_client() -> Client:
    """Dependency to get the Supabase client"""
    return supabase