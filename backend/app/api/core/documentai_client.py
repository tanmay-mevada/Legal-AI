import os
import re
from google.cloud import documentai_v1 as documentai
from google.api_core import exceptions as gcp_exceptions

_client = None
_processor_name = None

def get_documentai_client():
    """Get or create Document AI client with lazy initialization"""
    global _client, _processor_name
    
    if _client is None:
        project_id = os.getenv("GCP_PROJECT_ID")
        location = os.getenv("GCP_LOCATION", "us")
        processor_id = os.getenv("DOC_AI_PROCESSOR_ID")

        print(f"Document AI Config - Project: {project_id}, Location: {location}, Processor: {processor_id}")

        if not project_id or not processor_id:
            raise RuntimeError("Missing required Document AI environment variables: GCP_PROJECT_ID, DOC_AI_PROCESSOR_ID")

        _client = documentai.DocumentProcessorServiceClient()
        _processor_name = _client.processor_path(project_id, location, processor_id)
        print(f"Processor name: {_processor_name}")
    
    return _client, _processor_name

class DocumentAIError(Exception):
    """Custom exception for Document AI errors"""
    def __init__(self, message: str, error_code: str = None, user_message: str = None):
        self.message = message
        self.error_code = error_code
        self.user_message = user_message or message
        super().__init__(self.message)

def _parse_document_ai_error(error_message: str) -> tuple[str, str]:
    """Parse Document AI error message to extract error type and user-friendly message"""
    
    # Page limit exceeded
    if "PAGE_LIMIT_EXCEEDED" in error_message:
        page_match = re.search(r'(\d+) got (\d+)', error_message)
        if page_match:
            limit = page_match.group(1)
            actual = page_match.group(2)
            return "PAGE_LIMIT_EXCEEDED", f"Document has {actual} pages, but the limit is {limit} pages. Please split the document into smaller parts."
        return "PAGE_LIMIT_EXCEEDED", "Document exceeds the maximum page limit. Please split the document into smaller parts."
    
    # File size limit exceeded
    if "FILE_SIZE_EXCEEDED" in error_message or "file size" in error_message.lower():
        return "FILE_SIZE_EXCEEDED", "Document file size is too large. Please use a smaller file (max 20MB)."
    
    # Invalid file format
    if "INVALID_DOCUMENT" in error_message or "unsupported format" in error_message.lower():
        return "INVALID_DOCUMENT", "Document format is not supported. Please use PDF, DOC, or DOCX files."
    
    # Corrupted file
    if "CORRUPTED_DOCUMENT" in error_message or "corrupted" in error_message.lower():
        return "CORRUPTED_DOCUMENT", "Document appears to be corrupted. Please try uploading a different file."
    
    # Quota exceeded
    if "QUOTA_EXCEEDED" in error_message or "quota" in error_message.lower():
        return "QUOTA_EXCEEDED", "Processing quota exceeded. Please try again later."
    
    # Authentication/permission errors
    if "PERMISSION_DENIED" in error_message or "authentication" in error_message.lower():
        return "PERMISSION_DENIED", "Authentication error. Please contact support."
    
    # Default case
    return "UNKNOWN_ERROR", "Document processing failed. Please try again or contact support."

def process_document_bytes(file_bytes: bytes):
    print(f"Processing document with Document AI, file size: {len(file_bytes)} bytes")
    
    # Pre-validation checks
    if len(file_bytes) == 0:
        raise DocumentAIError("Empty file provided", "EMPTY_FILE", "The uploaded file is empty.")
    
    if len(file_bytes) > 20 * 1024 * 1024:  # 20MB limit
        raise DocumentAIError(f"File size {len(file_bytes)} bytes exceeds 20MB limit", "FILE_SIZE_EXCEEDED", 
                            "Document file size is too large. Please use a file smaller than 20MB.")
    
    raw_document = documentai.RawDocument(
        content=file_bytes,
        mime_type="application/pdf"
    )

    # Get the client and processor name
    client, processor_name = get_documentai_client()
    
    request = documentai.ProcessRequest(
        name=processor_name,
        raw_document=raw_document
    )

    try:
        print("Sending request to Document AI...")
        result = client.process_document(request=request)
        print("Document AI processing completed successfully")
        return result.document
    except gcp_exceptions.GoogleAPIError as e:
        print(f"Google API error: {e}")
        error_code, user_message = _parse_document_ai_error(str(e))
        raise DocumentAIError(str(e), error_code, user_message)
    except Exception as e:
        print(f"Unexpected Document AI error: {e}")
        error_code, user_message = _parse_document_ai_error(str(e))
        raise DocumentAIError(str(e), error_code, user_message)
