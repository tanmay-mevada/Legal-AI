import os
import uuid
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from app.core.firebase_admin import get_current_user_from_auth_header

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Supabase env vars missing")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

router = APIRouter()


# ---------------------------
# Schemas
# ---------------------------
class DocumentCreate(BaseModel):
    file_name: str
    bucket_path: str  # original path from frontend
    size_bytes: int | None = None
    content_type: str | None = None
    pages: int | None = None


# ---------------------------
# Routes
# ---------------------------
@router.post("/{doc_id}/process")
def process_document(doc_id: str, authorization: str | None = Header(None)):
    user = get_current_user_from_auth_header(authorization)
    uid = user.get("uid")

    # 1. Fetch document
    res = supabase.table("documents").select("*").eq("id", doc_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = res.data[0]
    if doc["user_id"] != uid:
        raise HTTPException(status_code=403, detail="Not owner")

    # 2. Mock processing result
    updated = supabase.table("documents").update({
        "status": "processed",
        "extracted_text": "This is sample extracted text. (Replace with Document AI output)"
    }).eq("id", doc_id).execute()

    if not updated.data:
        raise HTTPException(status_code=500, detail="Failed to update document")

    return {"message": "Document processed", "document": updated.data[0]}


@router.post("/", status_code=201)
def create_document(payload: DocumentCreate, authorization: str | None = Header(None)):
    """Insert document metadata into Supabase table"""
    user = get_current_user_from_auth_header(authorization)
    uid = user.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="No UID found")

    # Always generate a unique path in Supabase storage
    unique_filename = f"user-files/{uid}/{uuid.uuid4()}_{payload.file_name}"

    row = {
        "user_id": uid,
        "file_name": payload.file_name,
        "bucket_path": unique_filename,
        "content_type": payload.content_type,
        "size_bytes": payload.size_bytes,
        "pages": payload.pages,
        "status": "queued"
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

    try:
        res = supabase.table("documents").select("*").eq("id", doc_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase fetch failed: {str(e)}")

    if not res.data:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = res.data[0]
    if doc["user_id"] != uid:
        raise HTTPException(status_code=403, detail="Not owner")

    return {"document": doc}


@router.get("/{doc_id}/signed-url")
def create_signed_url(doc_id: str, expires_in: int = 3600, authorization: str | None = Header(None)):
    """Generate signed URL for accessing a file in Supabase storage"""
    user = get_current_user_from_auth_header(authorization)
    uid = user.get("uid")

    try:
        res = supabase.table("documents").select("*").eq("id", doc_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase fetch failed: {str(e)}")

    if not res.data:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = res.data[0]
    if doc["user_id"] != uid:
        raise HTTPException(status_code=403, detail="Not owner")

    bucket_name = "uploads"
    path = doc["bucket_path"]

    try:
        signed = supabase.storage.from_(bucket_name).create_signed_url(path, expires_in)
        signed_url = signed.get("signed_url") if isinstance(signed, dict) else signed
        return {"signed_url": signed_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signed URL creation failed: {str(e)}")
