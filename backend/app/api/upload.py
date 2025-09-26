from fastapi import APIRouter, UploadFile, File, Header, HTTPException
from app.api.core.firebase_admin import get_current_user_from_auth_header
from app.api.core.supabase import supabase
import os

router = APIRouter()

@router.post("/upload", status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    authorization: str | None = Header(None)
):
    """Handle file upload through backend using service_role key"""
    try:
        # Authenticate user
        user = get_current_user_from_auth_header(authorization)
        uid = user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="No UID found")

        # File size validation
        max_file_size = 20 * 1024 * 1024  # 20MB
        file_content = await file.read()
        file_size = len(file_content)
        
        if file_size > max_file_size:
            raise HTTPException(
                status_code=400, 
                detail=f"File size ({file_size / (1024*1024):.1f}MB) exceeds the maximum limit of 20MB"
            )
        
        if file_size == 0:
            raise HTTPException(status_code=400, detail="File appears to be empty")

        # File type validation
        allowed_types = [
            "application/pdf",
            "image/jpeg", "image/jpg", "image/png", "image/gif",
            "image/tiff", "image/webp", "image/bmp"
        ]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="File type not supported. Please upload PDF or image files"
            )

        # Sanitize filename
        original_filename = file.filename or "unnamed_file"
        safe_filename = "".join(c if c.isalnum() or c in '._-' else '_' for c in original_filename)
        bucket_path = f"user-files/{safe_filename}"
        
        # Upload to Supabase storage using service_role key
        try:
            bucket = os.getenv("SUPABASE_BUCKET", "uploads")
            print(f"Uploading file to bucket: {bucket}, path: {bucket_path}")
            
            # Upload file to storage
            storage_result = supabase.storage.from_(bucket).upload(
                path=bucket_path, 
                file=file_content,
                file_options={"content-type": file.content_type}
            )
            print(f"Storage upload result: {storage_result}")
            
        except Exception as storage_error:
            print(f"Storage upload failed: {storage_error}")
            raise HTTPException(
                status_code=500, 
                detail=f"Storage upload failed: {storage_error}"
            )
        
        # Create database record
        try:
            unique_file_key = f"{uid}:{original_filename}"
            row = {
                "user_id": uid,
                "file_name": original_filename,
                "bucket_path": bucket_path,
                "content_type": file.content_type,
                "size_bytes": file_size,
                "status": "uploaded",
                "unique_file_key": unique_file_key
            }
            
            res = supabase.table("documents").insert(row).execute()
            document = res.data[0]
            print(f"Document created: {document['id']}")
            
            return {
                "message": "File uploaded successfully",
                "document": document,
                "bucket_path": bucket_path
            }
            
        except Exception as db_error:
            print(f"Database insert failed: {db_error}")
            # Try to delete the uploaded file since DB insert failed
            try:
                supabase.storage.from_(bucket).remove([bucket_path])
            except:
                pass
            raise HTTPException(
                status_code=500, 
                detail=f"Database record creation failed: {db_error}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in upload: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")
