import os
from google.cloud import documentai_v1 as documentai

project_id = os.getenv("GCP_PROJECT_ID")
location = os.getenv("GCP_LOCATION", "us")
processor_id = os.getenv("DOC_AI_PROCESSOR_ID")

print(f"Document AI Config - Project: {project_id}, Location: {location}, Processor: {processor_id}")

if not project_id or not processor_id:
    raise RuntimeError("Missing required Document AI environment variables: GCP_PROJECT_ID, DOC_AI_PROCESSOR_ID")

client = documentai.DocumentProcessorServiceClient()
processor_name = client.processor_path(project_id, location, processor_id)
print(f"Processor name: {processor_name}")

def process_document_bytes(file_bytes: bytes):
    print(f"Processing document with Document AI, file size: {len(file_bytes)} bytes")
    
    raw_document = documentai.RawDocument(
        content=file_bytes,
        mime_type="application/pdf"
    )

    request = documentai.ProcessRequest(
        name=processor_name,
        raw_document=raw_document
    )

    print("Sending request to Document AI...")
    result = client.process_document(request=request)
    print("Document AI processing completed successfully")
    return result.document
