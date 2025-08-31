import os
from google.cloud import documentai_v1 as documentai
from google.oauth2 import service_account

PROJECT_ID = os.getenv("GCP_PROJECT_ID")
LOCATION = os.getenv("GCP_LOCATION", "us")  # e.g. "us" or "us-latency"
PROCESSOR_ID = os.getenv("DOCAI_PROCESSOR_ID")  # from GCP console

creds = service_account.Credentials.from_service_account_file(
    os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
)

client = documentai.DocumentProcessorServiceClient(credentials=creds)

def process_document_bytes(file_bytes: bytes, mime_type="application/pdf"):
    name = client.processor_path(PROJECT_ID, LOCATION, PROCESSOR_ID)

    raw_document = documentai.RawDocument(
        content=file_bytes,
        mime_type=mime_type
    )

    request = documentai.ProcessRequest(
        name=name,
        raw_document=raw_document
    )

    result = client.process_document(request=request)

    return result.document
