import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException
import json

# Initialize once
if not firebase_admin._apps:
    try:
        # Try to use service account key from environment variable
        if os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY"):
            service_account_info = json.loads(os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY"))
            cred = credentials.Certificate(service_account_info)
        elif os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
            cred = credentials.Certificate(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
        else:
            # Use Application Default Credentials for Cloud Run
            cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Firebase initialization error: {e}")
        # Initialize with default if all else fails
        firebase_admin.initialize_app()

def get_current_user_from_auth_header(authorization: str | None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = authorization.split(" ").pop()
    try:
        decoded = auth.verify_id_token(token)
        return decoded  # contains uid, email, etc.
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid ID token")