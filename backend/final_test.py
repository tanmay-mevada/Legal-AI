#!/usr/bin/env python3
"""
Final comprehensive test before deployment.
"""
import sys
import os
import logging

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(__file__))

def test_environment():
    """Test environment variables."""
    print("=== Testing Environment Variables ===")
    from dotenv import load_dotenv
    load_dotenv()
    
    required_vars = [
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY', 
        'FIREBASE_PROJECT_ID'
    ]
    
    optional_vars = [
        'GOOGLE_APPLICATION_CREDENTIALS',  # Not needed on Cloud Run
        'FIREBASE_SERVICE_ACCOUNT_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        value = os.environ.get(var)
        if value:
            print(f"✅ {var}: {'*' * min(len(value), 10)}...")
        else:
            print(f"❌ {var}: NOT SET")
            missing_vars.append(var)
    
    print("\nOptional variables:")
    for var in optional_vars:
        value = os.environ.get(var)
        if value:
            print(f"✅ {var}: {'*' * min(len(value), 10)}...")
        else:
            print(f"ℹ️  {var}: NOT SET (optional)")
    
    if missing_vars:
        print(f"⚠️  Missing required variables: {missing_vars}")
    else:
        print("✅ All required environment variables are set")
    
    return len(missing_vars) == 0

def test_imports():
    """Test all module imports."""
    print("\n=== Testing Module Imports ===")
    modules_to_test = [
        'app.api.core.supabase',
        'app.api.core.documentai_client', 
        'app.api.core.firebase_admin',
        'app.api.upload',
        'app.api.documents',
        'app.api.admin',
        'app.api.user_activity',
        'app.api.process'
    ]
    
    failed_imports = []
    for module in modules_to_test:
        try:
            __import__(module)
            print(f"✅ {module}")
        except Exception as e:
            print(f"❌ {module}: {e}")
            failed_imports.append(module)
    
    if failed_imports:
        print(f"⚠️  Failed imports: {failed_imports}")
    else:
        print("✅ All modules imported successfully")
    
    return len(failed_imports) == 0

def test_app_startup():
    """Test FastAPI app startup."""
    print("\n=== Testing FastAPI App Startup ===")
    try:
        from main import app
        print("✅ FastAPI app created successfully")
        
        # Test if we can access the app's routes
        routes = [route.path for route in app.routes]
        print(f"✅ App has {len(routes)} routes: {routes}")
        
        return True
    except Exception as e:
        print(f"❌ Failed to create FastAPI app: {e}")
        return False

def test_client_initialization():
    """Test lazy client initialization."""
    print("\n=== Testing Client Initialization ===")
    
    # Test Supabase client
    try:
        from app.api.core.supabase import get_supabase_client
        client = get_supabase_client()
        if client:
            print("✅ Supabase client initialized")
        else:
            print("❌ Supabase client is None")
    except Exception as e:
        print(f"❌ Supabase client error: {e}")
    
    # Test Document AI client
    try:
        from app.api.core.documentai_client import get_documentai_client
        client = get_documentai_client()
        if client:
            print("✅ Document AI client initialized")
        else:
            print("❌ Document AI client is None")
    except Exception as e:
        print(f"❌ Document AI client error: {e}")
    
    # Test Firebase Admin
    try:
        import firebase_admin
        # Check if Firebase app is initialized
        if firebase_admin._apps:
            print("✅ Firebase Admin initialized")
        else:
            print("❌ Firebase Admin not initialized")
    except Exception as e:
        print(f"❌ Firebase Admin error: {e}")

def main():
    """Run all tests."""
    print("🚀 Running Final Deployment Tests\n")
    
    env_ok = test_environment()
    imports_ok = test_imports()
    app_ok = test_app_startup()
    test_client_initialization()
    
    print("\n" + "="*50)
    if env_ok and imports_ok and app_ok:
        print("🎉 ALL TESTS PASSED! Ready for deployment!")
        print("Next steps:")
        print("1. Build Docker image: docker build -t legal-ai-backend .")
        print("2. Deploy to Cloud Run")
        print("3. Test endpoints on production")
    else:
        print("❌ Some tests failed. Please fix issues before deployment.")
        sys.exit(1)

if __name__ == "__main__":
    main()