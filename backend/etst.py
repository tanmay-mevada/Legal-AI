from dotenv import load_dotenv
load_dotenv(dotenv_path="d:/legal-ai/legal-ai/backend/.env")# Create a test file called test_imports.py in your backend directory
try:
    from app.api.upload import router as upload_router
    print("✓ upload router imported")
except Exception as e:
    print(f"✗ upload router failed: {e}")

try:
    from app.api.documents import router as documents_router
    print("✓ documents router imported")
except Exception as e:
    print(f"✗ documents router failed: {e}")

try:
    from app.api.admin import router as admin_router
    print("✓ admin router imported")
except Exception as e:
    print(f"✗ admin router failed: {e}")

try:
    from app.api.user_activity import router as activity_router
    print("✓ activity router imported")
except Exception as e:
    print(f"✗ activity router failed: {e}")

try:
    from app.api import process
    print("✓ process imported")
except Exception as e:
    print(f"✗ process failed: {e}")