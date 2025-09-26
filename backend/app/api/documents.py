import os
import io
import uuid
from datetime import datetime
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from app.api.core.firebase_admin import get_current_user_from_auth_header
from app.api.core.documentai_client import process_document_bytes, DocumentAIError
from app.api.core.gemini import summarize_with_gemini
from app.api.core.supabase import supabase  #wrapper we created

router = APIRouter()


def _parse_enhanced_response(response_text: str, extracted_text: str) -> tuple[str, str, dict]:
    """Parse the enhanced Gemini response to extract detailed explanation, summary and metadata"""
    try:
        # Split response into sections
        if "DETAILED EXPLANATION:" in response_text and "SUMMARY:" in response_text and "METADATA:" in response_text:
            # Split by sections
            parts = response_text.split("SUMMARY:")
            detailed_part = parts[0].replace("DETAILED EXPLANATION:", "").strip()
            
            remaining = parts[1] if len(parts) > 1 else ""
            summary_metadata_parts = remaining.split("METADATA:")
            summary_part = summary_metadata_parts[0].strip()
            metadata_part = summary_metadata_parts[1].strip() if len(summary_metadata_parts) > 1 else ""
            
            # Extract detailed explanation and summary
            detailed_explanation = detailed_part.strip()
            summary = summary_part.strip()
        elif "SUMMARY:" in response_text and "METADATA:" in response_text:
            # Fallback for old format (without detailed explanation)
            parts = response_text.split("METADATA:")
            summary_part = parts[0].replace("SUMMARY:", "").strip()
            metadata_part = parts[1].strip() if len(parts) > 1 else ""
            
            # Extract summary (no detailed explanation)
            detailed_explanation = ""
            summary = summary_part.strip()
        else:
            # Fallback: treat entire response as summary
            detailed_explanation = ""
            summary = response_text.strip()
            metadata_part = ""
        
        # Parse metadata
        metadata = {}
        if metadata_part:
            lines = metadata_part.split('\n')
            for line in lines:
                line = line.strip()
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip().lower().replace(' ', '')
                    value = value.strip()
                    
                    if key == 'documenttype':
                        metadata['documentType'] = value
                    elif key == 'complexity':
                        metadata['complexity'] = value
                    elif key == 'risklevel':
                        metadata['riskLevel'] = value
                    elif key == 'riskfactors':
                        if value.lower() == 'none':
                            metadata['riskFactors'] = []
                        else:
                            # Split by comma and clean up
                            factors = [f.strip() for f in value.split(',')]
                            metadata['riskFactors'] = factors[:3]  # Limit to 3
                    elif key == 'keyparties':
                        if value.lower() == 'none':
                            metadata['keyParties'] = []
                        else:
                            # Split by comma and clean up
                            parties = [p.strip() for p in value.split(',')]
                            metadata['keyParties'] = parties[:3]  # Limit to 3
                    elif key == 'wordcount':
                        try:
                            metadata['wordCount'] = int(value)
                        except:
                            metadata['wordCount'] = len(extracted_text.split())
                    elif key == 'pagecount':
                        metadata['pageCount'] = value
        
        # Set defaults for missing fields
        metadata.setdefault('documentType', None)
        metadata.setdefault('complexity', None)
        metadata.setdefault('riskLevel', None)
        metadata.setdefault('riskFactors', [])
        metadata.setdefault('keyParties', [])
        metadata.setdefault('wordCount', len(extracted_text.split()))
        metadata.setdefault('pageCount', None)
        
        return detailed_explanation, summary, metadata
    except Exception as e:
        print(f"Error parsing enhanced response: {e}")
        # Fallback: treat entire response as summary
        return "", response_text.strip(), {
            'documentType': None,
            'complexity': None,
            'riskLevel': None,
            'riskFactors': [],
            'keyParties': [],
            'wordCount': len(extracted_text.split()),
            'pageCount': None
        }


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

        # File size validation
        max_file_size = 20 * 1024 * 1024  # 20MB
        if payload.size_bytes > max_file_size:
            raise HTTPException(
                status_code=400, 
                detail=f"File size ({payload.size_bytes / (1024*1024):.1f}MB) exceeds the maximum limit of 20MB. Please use a smaller file."
            )
        
        if payload.size_bytes == 0:
            raise HTTPException(
                status_code=400,
                detail="File appears to be empty. Please upload a valid document."
            )

        # File type validation - Based on Google Document AI supported formats
        allowed_types = [
            "application/pdf",
            "image/jpeg",
            "image/png", 
            "image/gif",
            "image/tiff",
            "image/webp",
            "image/bmp"
        ]
        if payload.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="File type not supported. Please upload PDF or image files (JPEG, PNG, GIF, TIFF, WebP, BMP). Word documents (DOC/DOCX) are not currently supported by our document processing service."
            )

        # Generate unique document identifier: user_id + original_filename
        # This allows same filename per user but prevents duplicates per user
        unique_file_key = f"{uid}:{payload.file_name}"
        
        # Prepare the row data, conditionally including unique_file_key if it exists
        row = {
            "user_id": uid,
            "file_name": payload.file_name,
            "bucket_path": payload.bucket_path,
            "content_type": payload.content_type,
            "size_bytes": payload.size_bytes,
            "pages": payload.pages,
            "status": "uploaded",
        }
        
        # Try to include unique_file_key, but gracefully handle if column doesn't exist
        try:
            row["unique_file_key"] = unique_file_key
        except Exception as e:
            print(f"Note: unique_file_key column may not exist yet: {e}")

        print(f"Inserting row: {row}")
        
        # First, check if user already has a document with this filename (smart duplicate detection)
        # Check if unique_file_key column exists in the database
        try:
            existing_res = supabase.table("documents").select("*").eq("unique_file_key", unique_file_key).execute()
            if existing_res.data:
                existing_doc = existing_res.data[0]
                print(f"User {uid} already has document with filename '{payload.file_name}', returning existing document: {existing_doc['id']}")
                return {"document": existing_doc, "isExisting": True}
        except Exception as check_error:
            print(f"Error checking for existing document: {check_error}")
            # If unique_file_key column doesn't exist, fall back to checking by user_id and file_name
            try:
                print("Falling back to user_id + file_name duplicate check")
                fallback_res = supabase.table("documents").select("*").eq("user_id", uid).eq("file_name", payload.file_name).execute()
                if fallback_res.data:
                    existing_doc = fallback_res.data[0]
                    print(f"User {uid} already has document with filename '{payload.file_name}' (fallback check), returning existing document: {existing_doc['id']}")
                    return {"document": existing_doc, "isExisting": True}
            except Exception as fallback_error:
                print(f"Fallback duplicate check also failed: {fallback_error}")
            # Continue with insert attempt even if check fails
        
        try:
            res = supabase.table("documents").insert(row).execute()
            print(f"Document created successfully: {res.data[0]['id']}")
            return {"document": res.data[0], "isExisting": False}
        except Exception as e:
            error_str = str(e)
            print(f"Supabase insert failed: {error_str}")
            
            # Handle duplicate key constraint violation
            if "duplicate key value violates unique constraint" in error_str:
                # Try to find the existing document and return it
                try:
                    existing_res = supabase.table("documents").select("*").eq("unique_file_key", unique_file_key).execute()
                    if existing_res.data:
                        existing_doc = existing_res.data[0]
                        print(f"Returning existing document after duplicate error: {existing_doc['id']}")
                        return {"document": existing_doc, "isExisting": True}
                except Exception as fetch_error:
                    print(f"Error fetching existing document after duplicate: {fetch_error}")
                
                # If we can't find the existing document, return a user-friendly error
                raise HTTPException(
                    status_code=409, 
                    detail=f"You already have a document named '{payload.file_name}'. The existing conversation will be opened."
                )
            
            # For other database errors
            raise HTTPException(status_code=500, detail=f"Database error: Failed to create document record")
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

        # Debug: List files in the bucket to see what's actually there
        try:
            print("Listing files in bucket to debug...")
            files_list = supabase.storage.from_(bucket).list()
            print(f"Files in bucket root: {files_list}")
            
            # Also try to list files in user-files folder
            try:
                user_files = supabase.storage.from_(bucket).list("user-files")
                print(f"Files in user-files folder: {user_files}")
            except Exception as list_err:
                print(f"Could not list user-files folder: {list_err}")
                
        except Exception as debug_err:
            print(f"Could not list bucket contents: {debug_err}")

        try:
            print("Downloading file from storage...")
            file_response = supabase.storage.from_(bucket).download(clean_path)
            print(f"File response type: {type(file_response)}")
        except Exception as e:
            print(f"Storage download failed: {e}")
            # Try with different path variations
            try:
                print("Trying download without user-files prefix...")
                filename_only = clean_path.replace("user-files/", "")
                file_response = supabase.storage.from_(bucket).download(filename_only)
                print(f"Download successful with filename only: {filename_only}")
            except Exception as e2:
                print(f"Alternative download also failed: {e2}")
                raise HTTPException(status_code=500, detail=f"Storage download failed. File may not exist or incorrect permissions. Original error: {e}")

        if not file_response:
            print("Empty file response from storage")
            raise HTTPException(status_code=500, detail="Failed to download file")
        
        file_bytes = io.BytesIO(file_response).read()
        print(f"File downloaded successfully, size: {len(file_bytes)} bytes")

        # 3. Process with Document AI
        try:
            print("Processing with Document AI...")
            result = process_document_bytes(file_bytes, doc["content_type"])
            print("Document AI processing completed")
        except DocumentAIError as e:
            print(f"Document AI error: {e.message}")
            # Update document status to failed (only using existing columns)
            try:
                supabase.table("documents").update({
                    "status": "failed",
                    "processed_at": datetime.utcnow().isoformat()
                }).eq("id", doc_id).execute()
            except Exception as update_error:
                print(f"Failed to update document status: {update_error}")
            
            # Return user-friendly error message
            raise HTTPException(
                status_code=400 if e.error_code in ["PAGE_LIMIT_EXCEEDED", "FILE_SIZE_EXCEEDED", "INVALID_DOCUMENT"] else 500,
                detail=e.user_message
            )
        except Exception as e:
            print(f"Unexpected Document AI error: {e}")
            # Update document status to failed (only using existing columns)
            try:
                supabase.table("documents").update({
                    "status": "failed",
                    "processed_at": datetime.utcnow().isoformat()
                }).eq("id", doc_id).execute()
            except Exception as update_error:
                print(f"Failed to update document status: {update_error}")
            raise HTTPException(status_code=500, detail="Document processing failed. Please try again or contact support.")

        # 4. Update DB with extracted text
        extracted_text = result.text
        print(f"Extracted text length: {len(extracted_text)} characters")
        
        # 5. Summarize with Gemini (Vertex) - Enhanced with structured data
        try:
            print("Starting Gemini enhanced analysis...")
            
            # Use enhanced prompt that includes structured data request
            enhanced_prompt = f"""
You are a legal document analyzer. Analyze this document and provide a detailed explanation, summary, and structured metadata.

DOCUMENT ANALYSIS:
{extracted_text[:120000]}

Please provide your response in this exact format:

DETAILED EXPLANATION:
[Provide a comprehensive 5-7 bullet point analysis covering:
- Executive summary of the document
- Key obligations and responsibilities
- Important terms and conditions
- Potential risks and red flags
- Termination/renewal/penalty clauses (if present)
- Any other critical information]

SUMMARY:
[Provide a concise 2-3 sentence summary of the document]

METADATA:
Document Type: [Contract/Agreement/Policy/Legal Brief/Court Document/Other]
Complexity: [Simple/Moderate/Complex]
Risk Level: [Low/Medium/High]
Risk Factors: [List up to 3 key risk factors, or "None" if no significant risks]
Key Parties: [List up to 3 key parties involved, or "None" if not applicable]
Word Count: {len(extracted_text.split())}
Page Count: [Estimated based on content length]
"""

            # Get enhanced response from Gemini
            enhanced_response = summarize_with_gemini(enhanced_prompt, max_tokens=1200)
            
            # Parse the structured response
            detailed_explanation, summary, metadata = _parse_enhanced_response(enhanced_response, extracted_text)
            
            if summary is not None and not summary.strip():
                print("Gemini returned empty summary")
                summary = None
            else:
                print(f"Gemini analysis completed, summary length: {len(summary) if summary else 0}")
                print(f"Detailed explanation length: {len(detailed_explanation) if detailed_explanation else 0}")
                print(f"Document type: {metadata.get('documentType')}")
                print(f"Risk level: {metadata.get('riskLevel')}")
                print(f"Complexity: {metadata.get('complexity')}")
                
        except Exception as e:
            print(f"Gemini enhanced analysis error: {e}")
            # Provide a comprehensive fallback summary
            try:
                # Try basic Gemini summary first
                summary = summarize_with_gemini(extracted_text)
                detailed_explanation = ""
                metadata = {
                    'documentType': None,
                    'complexity': None,
                    'riskLevel': None,
                    'riskFactors': [],
                    'keyParties': [],
                    'wordCount': len(extracted_text.split()),
                    'pageCount': None
                }
            except Exception as fallback_error:
                print(f"Fallback summary also failed: {fallback_error}")
                # Ultimate fallback - create basic text-based summary
                word_count = len(extracted_text.split())
                char_count = len(extracted_text)
                summary = (f"Document processed successfully. Contains {word_count} words and {char_count} characters. "
                          f"AI analysis is temporarily unavailable, but you can review the full document text below.")
                detailed_explanation = ""
                metadata = {
                    'documentType': None,
                    'complexity': None,
                    'riskLevel': None,
                    'riskFactors': [],
                    'keyParties': [],
                    'wordCount': word_count,
                    'pageCount': None
                }

        print("Updating database with results...")
        supabase.table("documents").update({
            "status": "processed",
            "extracted_text": extracted_text,
            "summary": summary,
            "detailed_explanation": detailed_explanation,
            "document_metadata": metadata,
            "processed_at": datetime.utcnow().isoformat()
        }).eq("id", doc_id).execute()

        print("Processing completed successfully")
        return {
            "message": "Processing complete",
            "extracted_text": extracted_text,
            "summary": (summary or ""),
            "detailed_explanation": (detailed_explanation or "")
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
