import os
import io
import uuid
from datetime import datetime
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from app.core.firebase_admin import get_current_user_from_auth_header
from app.core.documentai_client import process_document_bytes
from app.core.gemini import summarize_with_gemini
from app.core.supabase import supabase  # ✅ wrapper we created

router = APIRouter()


# ---------------------------
# Schemas
# ---------------------------
class DocumentCreate(BaseModel):
    file_name: str
    bucket_path: str  # frontend will send the path it uploaded to
    size_bytes: int | None = None
    content_type: str | None = None
    pages: int | None = None


# ---------------------------
# Routes
# ---------------------------
@router.post("/", status_code=201)
def create_document(payload: DocumentCreate, authorization: str | None = Header(None)):
    """Insert document metadata into Supabase table"""
    user = get_current_user_from_auth_header(authorization)
    uid = user.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="No UID found")

    # ✅ Use the exact path frontend used (don’t generate a new one here)
    row = {
        "user_id": uid,
        "file_name": payload.file_name,
        "bucket_path": payload.bucket_path,  # keep consistent with Supabase
        "content_type": payload.content_type,
        "size_bytes": payload.size_bytes,
        "pages": payload.pages,
        "status": "uploaded",
    }

    try:
        res = supabase.table("documents").insert(row).execute()
        return {"document": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase insert failed: {str(e)}")


@router.get("/")
def list_documents(authorization: str | None = Header(None)):
    """List all documents belonging to current user"""
    user = get_current_user_from_auth_header(authorization)
    uid = user.get("uid")

    try:
        res = (
            supabase.table("documents")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", desc=True)
            .execute()
        )
        return {"documents": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")


@router.get("/{doc_id}")
def get_document(doc_id: str, authorization: str | None = Header(None)):
    """Get a single document by ID, ensuring ownership"""
    user = get_current_user_from_auth_header(authorization)
    uid = user.get("uid")

    res = supabase.table("documents").select("*").eq("id", doc_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = res.data[0]
    if doc["user_id"] != uid:
        raise HTTPException(status_code=403, detail="Not owner")

    return {"document": doc}


@router.post("/{doc_id}/process")
def process_file(doc_id: str, authorization: str | None = Header(None)):
    """Download file from storage, process with Document AI, update DB"""
    user = get_current_user_from_auth_header(authorization)
    uid = user.get("uid")

    # 1. Get document metadata
    res = supabase.table("documents").select("*").eq("id", doc_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = res.data[0]
    if doc["user_id"] != uid:
        raise HTTPException(status_code=403, detail="Not owner")

    # 2. Download file from Supabase storage
    bucket = os.getenv("SUPABASE_BUCKET", "uploads")
    clean_path = doc["bucket_path"]  # ✅ already relative to bucket
    print("Bucket:", bucket)
    print("Path used for download:", clean_path)

    try:
        file_response = supabase.storage.from_(bucket).download(clean_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage download failed: {e}")

    if not file_response:
        raise HTTPException(status_code=500, detail="Failed to download file")
    file_bytes = io.BytesIO(file_response).read()

    # 3. Process with Document AI
    try:
        result = process_document_bytes(file_bytes)
    except Exception as e:
        print("Document AI error:", e)
        raise HTTPException(status_code=500, detail=f"Document AI failed: {e}")

    # 4. Update DB with extracted text
    extracted_text = result.text
    # 5. Summarize with Gemini (Vertex)
    try:
        summary = summarize_with_gemini(extracted_text)
        if summary is not None and not summary.strip():
            print("Gemini returned empty summary")
            summary = None  # store NULL instead of empty string
    except Exception as e:
        print("Gemini error:", e)
        summary = None  # don't fail the whole request if summary fails

    supabase.table("documents").update({
        "status": "processed",
        "extracted_text": extracted_text,
        "summary": summary,
        "processed_at": datetime.utcnow().isoformat()
    }).eq("id", doc_id).execute()

    return {
        "message": "Processing complete",
        "extracted_text": extracted_text[:500],
        "summary": (summary[:500] if summary else "")
    }


@router.get("/{doc_id}/signed-url")
def create_signed_url(doc_id: str, expires_in: int = 3600, authorization: str | None = Header(None)):
    """Generate signed URL for accessing a file in Supabase storage"""
    user = get_current_user_from_auth_header(authorization)
    uid = user.get("uid")

    res = supabase.table("documents").select("*").eq("id", doc_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = res.data[0]
    if doc["user_id"] != uid:
        raise HTTPException(status_code=403, detail="Not owner")

    bucket_name = os.getenv("SUPABASE_BUCKET", "uploads")
    path = doc["bucket_path"]

    signed = supabase.storage.from_(bucket_name).create_signed_url(path, expires_in)
    signed_url = signed.get("signed_url") if isinstance(signed, dict) else signed
    return {"signed_url": signed_url}
