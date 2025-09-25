import os
from supabase import create_client, Client

_supabase_client = None

def get_supabase_client() -> Client:
    """Get or create Supabase client with lazy initialization"""
    global _supabase_client
    
    if _supabase_client is None:
        SUPABASE_URL: str = os.getenv("SUPABASE_URL")
        SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not SUPABASE_URL or not SUPABASE_KEY:
            print(f"Warning: Missing Supabase credentials. URL: {'SET' if SUPABASE_URL else 'MISSING'}, KEY: {'SET' if SUPABASE_KEY else 'MISSING'}")
            raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment")

        try:
            _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            print("Supabase client initialized successfully")
        except Exception as e:
            print(f"Failed to initialize Supabase client: {e}")
            raise
    
    return _supabase_client

# For backward compatibility - lazy property
class SupabaseProxy:
    def __getattr__(self, name):
        return getattr(get_supabase_client(), name)

supabase = SupabaseProxy()
