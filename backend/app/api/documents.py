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
    try:
        print(f"Creating document: {payload.file_name}")
        print(f"Bucket path: {payload.bucket_path}")
        
        user = get_current_user_from_auth_header(authorization)
        uid = user.get("uid")
        if not uid:
            print("No UID found in user data")
            raise HTTPException(status_code=401, detail="No UID found")

        print(f"User UID: {uid}")

        # ✅ Use the exact path frontend used (don't generate a new one here)
        row = {
            "user_id": uid,
            "file_name": payload.file_name,
            "bucket_path": payload.bucket_path,  # keep consistent with Supabase
            "content_type": payload.content_type,
            "size_bytes": payload.size_bytes,
            "pages": payload.pages,
            "status": "uploaded",
        }

        print(f"Inserting row: {row}")
        
        try:
            res = supabase.table("documents").insert(row).execute()
            print(f"Document created successfully: {res.data[0]['id']}")
            return {"document": res.data[0]}
        except Exception as e:
            print(f"Supabase insert failed: {e}")
            raise HTTPException(status_code=500, detail=f"Supabase insert failed: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in create_document: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


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
    """Get a single document by ID, ensuring ownership. Returns extracted_text and summary for frontend polling."""
    user = get_current_user_from_auth_header(authorization)
    uid = user.get("uid")

    res = supabase.table("documents").select("*").eq("id", doc_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = res.data[0]
    if doc["user_id"] != uid:
        raise HTTPException(status_code=403, detail="Not owner")

    # Ensure extracted_text and summary are always present in response
    return {
        "document": {
            **doc,
            "extracted_text": doc.get("extracted_text", ""),
            "summary": doc.get("summary", ""),
        }
    }


@router.post("/{doc_id}/process")
def process_file(doc_id: str, authorization: str | None = Header(None)):
    """Download file from storage, process with Document AI, update DB"""
    try:
        print(f"Starting processing for document {doc_id}")
        user = get_current_user_from_auth_header(authorization)
        uid = user.get("uid")
        print(f"User authenticated: {uid}")

        # 1. Get document metadata
        print("Fetching document metadata...")
        res = supabase.table("documents").select("*").eq("id", doc_id).execute()
        if not res.data:
            print("Document not found in database")
            raise HTTPException(status_code=404, detail="Document not found")
        doc = res.data[0]
        if doc["user_id"] != uid:
            print("User not authorized for this document")
            raise HTTPException(status_code=403, detail="Not owner")
        print(f"Document found: {doc['file_name']}")

        # 2. Download file from Supabase storage
        bucket = os.getenv("SUPABASE_BUCKET", "uploads")
        clean_path = doc["bucket_path"]  # ✅ already relative to bucket
        print(f"Bucket: {bucket}")
        print(f"Path used for download: {clean_path}")

        try:
            print("Downloading file from storage...")
            file_response = supabase.storage.from_(bucket).download(clean_path)
            print(f"File response type: {type(file_response)}")
        except Exception as e:
            print(f"Storage download failed: {e}")
            raise HTTPException(status_code=500, detail=f"Storage download failed: {e}")

        if not file_response:
            print("Empty file response from storage")
            raise HTTPException(status_code=500, detail="Failed to download file")
        
        file_bytes = io.BytesIO(file_response).read()
        print(f"File downloaded successfully, size: {len(file_bytes)} bytes")

        # 3. Process with Document AI
        try:
            print("Processing with Document AI...")
            result = process_document_bytes(file_bytes)
            print("Document AI processing completed")
        except Exception as e:
            print(f"Document AI error: {e}")
            raise HTTPException(status_code=500, detail=f"Document AI failed: {e}")

        # 4. Update DB with extracted text
        extracted_text = result.text
        print(f"Extracted text length: {len(extracted_text)} characters")
        
        # 5. Summarize with Gemini (Vertex)
        try:
            print("Starting Gemini summarization...")
            summary = summarize_with_gemini(extracted_text)
            if summary is not None and not summary.strip():
                print("Gemini returned empty summary")
                summary = None  # store NULL instead of empty string
            else:
                print(f"Gemini summary completed, length: {len(summary) if summary else 0}")
        except Exception as e:
            print(f"Gemini error: {e}")
            summary = None  # don't fail the whole request if summary fails

        print("Updating database with results...")
        supabase.table("documents").update({
            "status": "processed",
            "extracted_text": extracted_text,
            "summary": summary,
            "processed_at": datetime.utcnow().isoformat()
        }).eq("id", doc_id).execute()

        print("Processing completed successfully")
        return {
            "message": "Processing complete",
            "extracted_text": extracted_text,
            "summary": (summary or "")
        }
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Unexpected error in process_file: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


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
