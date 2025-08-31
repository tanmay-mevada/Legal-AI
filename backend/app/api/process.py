import io
from datetime import datetime
from fastapi import APIRouter, Header, HTTPException
from app.core.firebase_admin import get_current_user_from_auth_header
from app.core.documentai_client import process_document_bytes
from app.api.documents import supabase  # reuse client

router = APIRouter()

@router.post("/{doc_id}/process")
def process_file(doc_id: str, authorization: str | None = Header(None)):
    user = get_current_user_from_auth_header(authorization)
    uid = user.get("uid")

    # 1. Get document metadata from DB
    res = supabase.table("documents").select("*").eq("id", doc_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = res.data[0]
    if doc["user_id"] != uid:
        raise HTTPException(status_code=403, detail="Not owner")

    # 2. Download file from Supabase bucket
    bucket = "uploads"
    path = doc["bucket_path"]
    file_response = supabase.storage.from_(bucket).download(path)
    if not file_response:
        raise HTTPException(status_code=500, detail="Failed to download file")

    file_bytes = io.BytesIO(file_response).read()

    # 3. Send file to Google Document AI
    try:
        result = process_document_bytes(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document AI failed: {e}")

    # 4. Store extracted text in DB
    extracted_text = result.text
    supabase.table("documents").update({
        "status": "processed",
        "extracted_text": extracted_text,
        "processed_at": datetime.utcnow().isoformat()
    }).eq("id", doc_id).execute()

    return {"message": "Processing complete", "extracted_text": extracted_text[:500]}  # return preview
