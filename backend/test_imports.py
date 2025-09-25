#!/usr/bin/env python3
"""
Test script to verify all imports work correctly
Run this before deploying to catch import issues early
"""
import sys
import traceback
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
print(f"Environment loaded - Supabase URL: {'SET' if os.getenv('SUPABASE_URL') else 'MISSING'}")

def test_import(module_name, description):
    """Test importing a module and report results"""
    try:
        if module_name == "main_app":
            # Special case for main app
            from main import app
            print(f"✅ {description}")
            return True
        else:
            __import__(module_name)
            print(f"✅ {description}")
            return True
    except Exception as e:
        print(f"❌ {description}: {e}")
        traceback.print_exc()
        return False

def main():
    """Run all import tests"""
    print("Testing imports...")
    
    tests = [
        ("os", "Standard library"),
        ("dotenv", "python-dotenv"),
        ("fastapi", "FastAPI"),
        ("firebase_admin", "Firebase Admin SDK"),
        ("supabase", "Supabase client"),
        ("app.api.core.firebase_admin", "Firebase admin core"),
        ("app.api.core.supabase", "Supabase core"),
        ("app.api.user_activity", "User activity router"),
        ("app.api.documents", "Documents router"),
        ("app.api.admin", "Admin router"),
        ("app.api.upload", "Upload router"),
        ("app.api.process", "Process router"),
        ("main_app", "Main FastAPI app"),
    ]
    
    passed = 0
    total = len(tests)
    
    for module, description in tests:
        if test_import(module, description):
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All imports successful! Ready to deploy.")
        return 0
    else:
        print("💥 Some imports failed. Fix issues before deploying.")
        return 1

if __name__ == "__main__":
    sys.exit(main())