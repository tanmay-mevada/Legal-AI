from fastapi import APIRouter, Depends, HTTPException, Header
from app.api.core.firebase_admin import get_current_user_from_auth_header
from app.api.core.supabase import supabase
from typing import List, Dict, Any
from datetime import datetime
import os

router = APIRouter()

def get_admin_emails() -> list:
    """Get admin emails from environment variable"""
    emails = os.getenv("ADMIN_EMAILS", "")
    return [e.strip() for e in emails.split(",") if e.strip()]

def is_admin_user(user: Dict[str, Any]) -> bool:
    """Check if the user is an admin"""
    user_email = user.get("email", "")
    return user_email in get_admin_emails()

@router.get("/test")
def test_admin_endpoint():
    """Test endpoint to verify admin API is working"""
    return {"message": "Admin API is working", "timestamp": datetime.utcnow().isoformat()}

@router.get("/users")
def get_all_users(authorization: str | None = Header(None)):
    """Get all users with their documents - Admin only"""
    user = get_current_user_from_auth_header(authorization)
    
    if not is_admin_user(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Get all documents from Supabase
        res = supabase.table("documents").select("*").order("created_at", desc=True).execute()
        # Defensive: check for error attribute, otherwise check for 'data'
        documents = getattr(res, "data", None)
        if documents is None:
            print("Supabase error: No data returned")
            raise HTTPException(status_code=500, detail="Supabase query failed: No data returned")
        print(f"Found {len(documents)} documents")

        # Group documents by user_id
        user_documents_map = {}
        for doc in documents:
            user_id = doc["user_id"]
            if user_id not in user_documents_map:
                user_documents_map[user_id] = []
            user_documents_map[user_id].append(doc)

        # Try to get user activity data (optional - won't fail if table doesn't exist)
        activity_map = {}
        try:
            activity_res = supabase.table("user_activity").select("*").execute()
            if hasattr(activity_res, "data") and activity_res.data:
                for activity in activity_res.data:
                    activity_map[activity["user_id"]] = activity
        except Exception as e:
            print(f"Warning: Could not fetch user activity data: {e}")

        # Create user objects with document data
        users_with_docs = []
        for user_id, user_docs in user_documents_map.items():
            total_documents = len(user_docs)
            total_size = sum(doc.get("size_bytes", 0) for doc in user_docs)

            # Get user activity data (with fallbacks)
            user_activity = activity_map.get(user_id, {})
            last_login = user_activity.get("last_login", user_docs[0]["created_at"] if user_docs else datetime.utcnow().isoformat())
            login_count = user_activity.get("login_count", 0)

            users_with_docs.append({
                "uid": user_id,
                "email": user_activity.get("email", f"user-{user_id[:8]}@example.com"),
                "displayName": f"User {user_id[:8]}",
                "lastSignInTime": last_login,
                "loginCount": login_count,
                "documents": user_docs,
                "totalDocuments": total_documents,
                "totalSize": total_size,
            })

        return {"users": users_with_docs}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")

@router.get("/stats")
def get_admin_stats(authorization: str | None = Header(None)):
    """Get admin dashboard statistics - Admin only"""
    user = get_current_user_from_auth_header(authorization)
    
    if not is_admin_user(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Get all documents
        res = supabase.table("documents").select("*").execute()
        
        documents = res.data or []
        
        # Calculate stats
        total_documents = len(documents)
        total_size = sum(doc.get("size_bytes", 0) for doc in documents)
        unique_users = len(set(doc["user_id"] for doc in documents))
        
        # Status breakdown
        status_counts = {}
        for doc in documents:
            status = doc.get("status", "unknown")
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Recent activity (last 7 days)
        from datetime import datetime, timedelta
        week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        recent_docs = [doc for doc in documents if doc["created_at"] >= week_ago]
        
        return {
            "totalUsers": unique_users,
            "totalDocuments": total_documents,
            "totalSize": total_size,
            "statusCounts": status_counts,
            "recentActivity": {
                "documentsLastWeek": len(recent_docs),
                "newUsersLastWeek": len(set(doc["user_id"] for doc in recent_docs))
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

@router.get("/user/{user_id}/documents")
def get_user_documents(user_id: str, authorization: str | None = Header(None)):
    """Get all documents for a specific user - Admin only"""
    user = get_current_user_from_auth_header(authorization)
    
    if not is_admin_user(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        res = supabase.table("documents").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        
        return {"documents": res.data or []}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user documents: {str(e)}")

@router.delete("/user/{user_id}/document/{doc_id}")
def delete_user_document(user_id: str, doc_id: str, authorization: str | None = Header(None)):
    """Delete a specific document - Admin only"""
    user = get_current_user_from_auth_header(authorization)
    
    if not is_admin_user(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # First verify the document belongs to the user
        res = supabase.table("documents").select("*").eq("id", doc_id).eq("user_id", user_id).execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete the document
        delete_res = supabase.table("documents").delete().eq("id", doc_id).execute()
        
        return {"message": "Document deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")
