from fastapi import APIRouter, Depends, HTTPException, Header
from app.core.firebase_admin import get_current_user_from_auth_header
from app.core.supabase import supabase
from typing import Dict, Any
from datetime import datetime

router = APIRouter()

@router.post("/track-login")
def track_user_login(authorization: str | None = Header(None)):
    """Track user login activity"""
    user = get_current_user_from_auth_header(authorization)
    uid = user.get("uid")
    email = user.get("email", "")
    
    if not uid:
        raise HTTPException(status_code=401, detail="No UID found")
    
    try:
        # Insert or update user activity record
        activity_data = {
            "user_id": uid,
            "email": email,
            "last_login": datetime.utcnow().isoformat(),
            "login_count": 1
        }
        
        # Check if user activity record exists
        existing = supabase.table("user_activity").select("*").eq("user_id", uid).execute()
        
        if existing.data:
            # Update existing record
            res = supabase.table("user_activity").update({
                "last_login": activity_data["last_login"],
                "login_count": existing.data[0]["login_count"] + 1
            }).eq("user_id", uid).execute()
        else:
            # Insert new record
            res = supabase.table("user_activity").insert(activity_data).execute()
        
        if res.error:
            raise HTTPException(status_code=500, detail=f"Failed to track login: {res.error}")
        
        return {"message": "Login tracked successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error tracking login: {str(e)}")

@router.get("/activity/{user_id}")
def get_user_activity(user_id: str, authorization: str | None = Header(None)):
    """Get user activity data"""
    user = get_current_user_from_auth_header(authorization)
    
    # Allow users to view their own activity or admin users
    if user.get("uid") != user_id and user.get("email") not in ["admin@legalai.com", "tanma@example.com"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        res = supabase.table("user_activity").select("*").eq("user_id", user_id).execute()
        
        if res.error:
            raise HTTPException(status_code=500, detail=f"Failed to fetch activity: {res.error}")
        
        return {"activity": res.data[0] if res.data else None}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching activity: {str(e)}")
