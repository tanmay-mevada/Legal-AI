# Enhanced Error Handling for Legal AI

## Overview
This document outlines the comprehensive error handling system implemented for the Legal AI application, covering Document AI errors, file validation, and user-friendly error messages.

## Backend Error Handling

### Document AI Error Types

The system now handles the following Document AI error types:

#### 1. Page Limit Exceeded
- **Error Code**: `PAGE_LIMIT_EXCEEDED`
- **Cause**: Document has more than 30 pages
- **User Message**: "Document has X pages, but the limit is 30 pages. Please split the document into smaller parts."
- **HTTP Status**: 400 (Bad Request)

#### 2. File Size Exceeded
- **Error Code**: `FILE_SIZE_EXCEEDED`
- **Cause**: File size exceeds 20MB limit
- **User Message**: "Document file size is too large. Please use a file smaller than 20MB."
- **HTTP Status**: 400 (Bad Request)

#### 3. Invalid Document Format
- **Error Code**: `INVALID_DOCUMENT`
- **Cause**: Unsupported file format
- **User Message**: "Document format is not supported. Please use PDF, DOC, or DOCX files."
- **HTTP Status**: 400 (Bad Request)

#### 4. Corrupted Document
- **Error Code**: `CORRUPTED_DOCUMENT`
- **Cause**: File appears to be corrupted
- **User Message**: "Document appears to be corrupted. Please try uploading a different file."
- **HTTP Status**: 500 (Internal Server Error)

#### 5. Quota Exceeded
- **Error Code**: `QUOTA_EXCEEDED`
- **Cause**: Processing quota exceeded
- **User Message**: "Processing quota exceeded. Please try again later."
- **HTTP Status**: 500 (Internal Server Error)

#### 6. Permission Denied
- **Error Code**: `PERMISSION_DENIED`
- **Cause**: Authentication or permission issues
- **User Message**: "Authentication error. Please contact support."
- **HTTP Status**: 500 (Internal Server Error)

### Implementation Details

#### Document AI Client (`documentai_client.py`)

```python
class DocumentAIError(Exception):
    """Custom exception for Document AI errors"""
    def __init__(self, message: str, error_code: str = None, user_message: str = None):
        self.message = message
        self.error_code = error_code
        self.user_message = user_message or message
        super().__init__(self.message)

def _parse_document_ai_error(error_message: str) -> tuple[str, str]:
    """Parse Document AI error message to extract error type and user-friendly message"""
    # Handles all error types with regex parsing and user-friendly messages
```

#### Document Processing (`documents.py`)

```python
try:
    result = process_document_bytes(file_bytes)
except DocumentAIError as e:
    # Update document status to failed with specific error
    supabase.table("documents").update({
        "status": "failed",
        "error_message": e.user_message,
        "error_code": e.error_code,
        "processed_at": datetime.utcnow().isoformat()
    }).eq("id", doc_id).execute()
    
    # Return user-friendly error message
    raise HTTPException(
        status_code=400 if e.error_code in ["PAGE_LIMIT_EXCEEDED", "FILE_SIZE_EXCEEDED", "INVALID_DOCUMENT"] else 500,
        detail=e.user_message
    )
```

### File Validation

#### Upload Validation
- **File Size**: Maximum 20MB
- **File Types**: PDF, DOC, DOCX only
- **Empty Files**: Rejected with clear error message

#### Pre-Processing Validation
- **File Size Check**: Before sending to Document AI
- **Empty File Check**: Prevents processing empty files
- **Format Validation**: Ensures supported file types

## Frontend Error Handling

### Error Display Component

The `ErrorDisplay` component provides:

- **Color-coded error types**: Different colors for different error severities
- **Clear error titles**: User-friendly error titles
- **Specific suggestions**: Actionable advice for each error type
- **File context**: Shows which file caused the error
- **Responsive design**: Works on all screen sizes

### Error Types in Frontend

#### 1. Page Limit Exceeded
- **Color**: Orange (warning)
- **Icon**: FileX
- **Suggestion**: "Please split your document into smaller parts (max 30 pages per file)."

#### 2. File Size Exceeded
- **Color**: Red (error)
- **Icon**: FileX
- **Suggestion**: "Please use a file smaller than 20MB."

#### 3. Invalid Document Format
- **Color**: Yellow (warning)
- **Icon**: AlertTriangle
- **Suggestion**: "Please upload PDF, DOC, or DOCX files only."

#### 4. Corrupted Document
- **Color**: Red (error)
- **Icon**: AlertTriangle
- **Suggestion**: "The file appears to be corrupted. Please try uploading a different file."

#### 5. Quota Exceeded
- **Color**: Blue (info)
- **Icon**: Clock
- **Suggestion**: "Please try again later or contact support if the issue persists."

#### 6. Permission Denied
- **Color**: Red (error)
- **Icon**: Shield
- **Suggestion**: "Please contact support for assistance."

### File Upload Validation

#### Client-Side Validation
```typescript
const handleFileSelect = (file: File) => {
  // File type validation
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type)) {
    alert('File type not supported. Please upload PDF, DOC, or DOCX files only.');
    return;
  }

  // File size validation (20MB limit)
  const maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    alert(`File size (${fileSizeMB}MB) exceeds the maximum limit of 20MB. Please use a smaller file.`);
    return;
  }

  if (file.size === 0) {
    alert('File appears to be empty. Please upload a valid document.');
    return;
  }

  setSelectedFile(file);
};
```

## Database Schema Updates

### Documents Table
Add the following columns to store error information:

```sql
ALTER TABLE documents ADD COLUMN error_code VARCHAR(50);
ALTER TABLE documents ADD COLUMN error_message TEXT;
```

### Error Storage
- **error_code**: Stores the specific error type (e.g., "PAGE_LIMIT_EXCEEDED")
- **error_message**: Stores the user-friendly error message
- **status**: Set to "failed" when errors occur
- **processed_at**: Timestamp when the error occurred

## User Experience Improvements

### 1. Proactive Validation
- **File size check**: Before upload
- **File type check**: Before upload
- **Empty file check**: Before upload

### 2. Clear Error Messages
- **Specific error types**: Users know exactly what went wrong
- **Actionable suggestions**: Clear next steps for users
- **File context**: Shows which file caused the issue

### 3. Visual Error Indicators
- **Color-coded errors**: Different colors for different severity levels
- **Appropriate icons**: Visual indicators for error types
- **Responsive design**: Works on all devices

### 4. Graceful Degradation
- **Fallback behavior**: System continues to work even with errors
- **Error recovery**: Users can retry or upload different files
- **Status tracking**: Clear document status in sidebar

## Testing Scenarios

### 1. Page Limit Testing
- Upload a document with >30 pages
- Verify error message shows actual page count
- Confirm suggestion to split document

### 2. File Size Testing
- Upload a file >20MB
- Verify error message shows actual file size
- Confirm suggestion to use smaller file

### 3. Format Testing
- Upload unsupported file types (TXT, PNG, etc.)
- Verify error message about supported formats
- Confirm suggestion to use PDF/DOC/DOCX

### 4. Corrupted File Testing
- Upload a corrupted PDF
- Verify error message about corruption
- Confirm suggestion to try different file

### 5. Network Error Testing
- Simulate network failures
- Verify graceful error handling
- Confirm retry suggestions

## Monitoring and Logging

### Error Tracking
- **Error codes**: Track specific error types
- **Error frequency**: Monitor common issues
- **User impact**: Track failed uploads

### Performance Monitoring
- **Processing times**: Monitor Document AI performance
- **Success rates**: Track successful vs failed processing
- **Quota usage**: Monitor API quota consumption

### User Feedback
- **Error messages**: Collect user feedback on error clarity
- **Success rates**: Monitor user success with different file types
- **Support requests**: Track common user issues

## Future Enhancements

### 1. Advanced Error Recovery
- **Automatic retry**: Retry failed processing with exponential backoff
- **File optimization**: Automatically compress large files
- **Format conversion**: Convert unsupported formats when possible

### 2. Enhanced Validation
- **Content validation**: Check if PDF is actually readable
- **Security scanning**: Scan for malicious content
- **Metadata extraction**: Extract document metadata for better validation

### 3. User Assistance
- **File splitting**: Help users split large documents
- **Format conversion**: Convert files to supported formats
- **Compression tools**: Help users reduce file sizes

### 4. Analytics and Insights
- **Error analytics**: Detailed error reporting and analysis
- **User behavior**: Track how users handle errors
- **Performance metrics**: Monitor system performance and reliability

## Conclusion

The enhanced error handling system provides:

- **Comprehensive error coverage**: Handles all common Document AI errors
- **User-friendly messages**: Clear, actionable error messages
- **Proactive validation**: Prevents errors before they occur
- **Graceful degradation**: System continues to work even with errors
- **Professional appearance**: Error messages suitable for legal professionals

This system ensures a smooth user experience while providing clear guidance when issues occur, making the Legal AI application more reliable and user-friendly.
