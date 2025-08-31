from dotenv import load_dotenv
import os
from supabase import create_client

load_dotenv()  # this loads .env from the project root

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "uploads")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase env vars missing")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
