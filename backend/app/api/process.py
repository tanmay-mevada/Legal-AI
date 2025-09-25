import os
import io
from datetime import datetime
from fastapi import APIRouter, Header, HTTPException
from app.api.core.firebase_admin import get_current_user_from_auth_header
from app.api.core.documentai_client import process_document_bytes
from app.api.core.supabase import supabase  # ✅ Supabase client wrapper

router = APIRouter()

@router.post("/{doc_id}/process")
def process_file(doc_id: str, authorization: str | None = Header(None)):
    """Download file from Supabase storage, process with Document AI, update DB"""
    # 1. Authenticate user
    user = get_current_user_from_auth_header(authorization)
    uid = user.get("uid")

    # 2. Fetch document metadata from Supabase
    res = supabase.table("documents").select("*").eq("id", doc_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = res.data[0]
    if doc["user_id"] != uid:
        raise HTTPException(status_code=403, detail="Not owner")

    bucket = os.getenv("SUPABASE_BUCKET", "uploads")
    storage_path = doc["bucket_path"]

    # Ensure we don’t duplicate bucket name in path
    clean_path = storage_path.replace(f"{bucket}/", "", 1)

    # 3. Download file from Supabase storage
    try:
        file_response = supabase.storage.from_(bucket).download(clean_path)
        if not file_response:
            raise HTTPException(status_code=500, detail="Empty file response from storage")
        file_bytes = io.BytesIO(file_response).read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download file: {e}")

    # 4. Send file to Google Document AI
    try:
        result = process_document_bytes(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document AI failed: {e}")

    # 5. Store extracted text back in Supabase
    extracted_text = result.text
    supabase.table("documents").update({
        "status": "processed",
        "extracted_text": extracted_text,
        "processed_at": datetime.utcnow().isoformat()
    }).eq("id", doc_id).execute()

    # 6. Return preview
    return {
        "message": "Processing complete",
        "extracted_text_preview": extracted_text[:500]  # only first 500 chars
    }
