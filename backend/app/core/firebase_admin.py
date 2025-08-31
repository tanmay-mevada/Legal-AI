import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException

# Initialize once
if not firebase_admin._apps:
    if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        cred = credentials.Certificate(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
    else:
        cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)

def get_current_user_from_auth_header(authorization: str | None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = authorization.split(" ").pop()
    try:
        decoded = auth.verify_id_token(token)
        return decoded  # contains uid, email, etc.
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid ID token")