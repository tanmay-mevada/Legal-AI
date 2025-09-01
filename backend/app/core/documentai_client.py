import os
from google.cloud import documentai_v1 as documentai

project_id = os.getenv("GCP_PROJECT_ID")
location = os.getenv("GCP_LOCATION", "us")
processor_id = os.getenv("DOC_AI_PROCESSOR_ID")

client = documentai.DocumentProcessorServiceClient()
processor_name = client.processor_path(project_id, location, processor_id)

def process_document_bytes(file_bytes: bytes):
    raw_document = documentai.RawDocument(
        content=file_bytes,
        mime_type="application/pdf"
    )

    request = documentai.ProcessRequest(
        name=processor_name,
        raw_document=raw_document
    )

    result = client.process_document(request=request)
    return result.document
