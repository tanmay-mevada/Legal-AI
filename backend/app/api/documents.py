import os
from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from datetime import datetime
from supabase import create_client
from app.core.firebase_admin import get_current_user_from_auth_header

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Supabase env vars missing")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

router = APIRouter()

class DocumentCreate(BaseModel):
    file_name: str
    bucket_path: str  # path inside uploads bucket, like "uid/lease.pdf"
    size_bytes: int | None = None
    content_type: str | None = None
    pages: int | None = None

@router.post("/", status_code=201)
def create_document(payload: DocumentCreate, authorization: str | None = Header(None)):
    user = get_current_user_from_auth_header(authorization)
    uid = user.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="No UID found")
    row = {
        "user_id": uid,
        "file_name": payload.file_name,
        "bucket_path": payload.bucket_path,
        "content_type": payload.content_type,
        "size_bytes": payload.size_bytes,
        "pages": payload.pages,
        "status": "queued"
    }
    res = supabase.table("documents").insert(row).execute()
    if res.error:
        raise HTTPException(status_code=500, detail=str(res.error))
    return {"document": res.data[0]}

@router.get("/")
def list_documents(authorization: str | None = Header(None)):
    user = get_current_user_from_auth_header(authorization)
    uid = user.get("uid")
    res = supabase.table("documents").select("*").eq("user_id", uid).order("created_at", {"ascending": False}).execute()
    if res.error:
        raise HTTPException(status_code=500, detail=str(res.error))
    return {"documents": res.data}

@router.get("/{doc_id}")
def get_document(doc_id: str, authorization: str | None = Header(None)):
    user = get_current_user_from_auth_header(authorization)
    uid = user.get("uid")
    res = supabase.table("documents").select("*").eq("id", doc_id).execute()
    if res.error:
        raise HTTPException(status_code=500, detail=str(res.error))
    if not res.data:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = res.data[0]
    if doc["user_id"] != uid:
        raise HTTPException(status_code=403, detail="Not owner")
    return {"document": doc}

@router.get("/{doc_id}/signed-url")
def create_signed_url(doc_id: str, expires_in: int = 3600, authorization: str | None = Header(None)):
    user = get_current_user_from_auth_header(authorization)
    uid = user.get("uid")
    res = supabase.table("documents").select("*").eq("id", doc_id).execute()
    if res.error:
        raise HTTPException(status_code=500, detail=str(res.error))
    if not res.data:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = res.data[0]
    if doc["user_id"] != uid:
        raise HTTPException(status_code=403, detail="Not owner")

    bucket_name = "uploads"  # your bucket
    path = doc["bucket_path"]
    signed = supabase.storage.from_(bucket_name).create_signed_url(path, expires_in)
    signed_url = signed.get("signed_url") if isinstance(signed, dict) else signed
    return {"signed_url": signed_url}
