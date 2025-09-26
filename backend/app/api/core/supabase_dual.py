import os
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYnlxdm10eWdzc3Rha3hqdHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyNTY3MTAsImV4cCI6MjA1MjgzMjcxMH0.jdJZOHzk5ZLwR5BRa6abwARLjVObEnHZyBaGL1M9TIk"

# Create Supabase clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)  # For database operations
supabase_storage: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)   # For storage operations