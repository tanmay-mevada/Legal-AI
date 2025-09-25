#!/usr/bin/env python3
"""
Test script to verify backend endpoints are working
"""

import requests
import json

BASE_URL = "https://fastapi-app-63563783552.us-east1.run.app"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health check: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_root():
    """Test root endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Root endpoint: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Root endpoint failed: {e}")
        return False

def test_documents_unauthorized():
    """Test documents endpoint without auth (should return 401)"""
    try:
        response = requests.get(f"{BASE_URL}/api/documents/")
        print(f"Documents (no auth): {response.status_code} - {response.text[:100]}")
        return response.status_code in [401, 403]  # Expected unauthorized
    except Exception as e:
        print(f"Documents test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing Legal AI Backend Endpoints")
    print("=" * 40)
    
    tests = [
        ("Health Check", test_health),
        ("Root Endpoint", test_root),
        ("Documents (Unauthorized)", test_documents_unauthorized)
    ]
    
    passed = 0
    for test_name, test_func in tests:
        print(f"\nRunning: {test_name}")
        if test_func():
            print(f"✅ PASSED: {test_name}")
            passed += 1
        else:
            print(f"❌ FAILED: {test_name}")
    
    print(f"\nResults: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 All tests passed! Backend is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the output above.")

if __name__ == "__main__":
    main()