from app.core.firebase_admin import firebase_admin
from fastapi import Depends, HTTPException, Header
from firebase_admin import auth as firebase_auth

def get_current_user(authorization: str = Header(None)):
    print("Authorization header received:", authorization)
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = authorization.split(" ").pop()
    try:
        decoded = firebase_auth.verify_id_token(token)
        # decoded contains uid, email, name, firebase claims
        return decoded
    except Exception as e:
        print("Token verification error:", e)
        raise HTTPException(status_code=401, detail="Invalid ID token")
