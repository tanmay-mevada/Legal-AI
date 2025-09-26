import os
from fastapi import APIRouter, HTTPException
from app.api.core.supabase import supabase

router = APIRouter()

@router.get("/storage/{bucket_name}/{path:path}")
def debug_storage_access(bucket_name: str, path: str):
    """Debug endpoint to test storage access"""
    try:
        print(f"Testing storage access to bucket: {bucket_name}, path: {path}")
        
        # Try to list files in the bucket
        try:
            files = supabase.storage.from_(bucket_name).list()
            print(f"Files in root of {bucket_name}: {files}")
        except Exception as e:
            print(f"Failed to list root files: {e}")
        
        # Try to check if the specific file exists
        try:
            file_response = supabase.storage.from_(bucket_name).download(path)
            print(f"File download successful, size: {len(file_response)} bytes")
            return {
                "success": True,
                "message": f"File exists and accessible",
                "file_size": len(file_response)
            }
        except Exception as e:
            print(f"File download failed: {e}")
            return {
                "success": False,
                "message": f"File not accessible: {str(e)}"
            }
            
    except Exception as e:
        print(f"Storage debug error: {e}")
        raise HTTPException(status_code=500, detail=f"Debug failed: {e}")

@router.get("/storage-list")
def debug_storage_list():
    """List all files in storage buckets"""
    try:
        # List files in the uploads bucket root
        root_result = supabase.storage.from_("uploads").list()
        
        # Also try to list files in the user-files subfolder
        user_files_result = None
        try:
            user_files_result = supabase.storage.from_("uploads").list("user-files")
        except Exception as subfolder_error:
            user_files_result = {"error": str(subfolder_error)}
        
        return {
            "bucket": "uploads",
            "root_files": root_result,
            "root_count": len(root_result) if root_result else 0,
            "user_files_folder": user_files_result,
            "user_files_count": len(user_files_result) if isinstance(user_files_result, list) else 0
        }
    except Exception as e:
        return {
            "error": str(e),
            "bucket": "uploads",
            "root_files": [],
            "user_files_folder": None
        }

@router.get("/storage-info")
def debug_storage_info():
    """Get storage configuration info"""
    try:
        bucket = os.getenv("SUPABASE_BUCKET", "uploads")
        url = os.getenv("SUPABASE_URL")
        key_set = bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
        
        return {
            "bucket": bucket,
            "supabase_url": url,
            "service_key_set": key_set,
            "message": "Storage config retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Config debug failed: {e}")