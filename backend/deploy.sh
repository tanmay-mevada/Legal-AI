# This script deploys the FastAPI application to Google Cloud Run.
# It explicitly sets all required environment variables to ensure the
# application starts correctly on the server.

# It's recommended to copy and paste the entire script at once to avoid errors.

gcloud run deploy fastapi-app \
    --image gcr.io/legal-ai-f8b0b/fastapi-app \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars \
        GCP_PROJECT_ID=legal-ai-f8b0b,\
        GCP_LOCATION=us,\
        DOC_AI_PROCESSOR_ID=409ad71f3fc2dd02,\
        GEMINI_LOCATION=us-east1,\
        GEMINI_MODEL=gemini-2.5-flash-lite,\
        PORT=8080,\
        SUPABASE_URL=https://vobyqvmtygsstakxjtph.supabase.co,\
        SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYnlxdm10eWdzc3Rha3hqdHBoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjYyNDI2OSwiZXhwIjoyMDcyMjAwMjY5fQ.iDLCFg0wTToye_6jMjq_NfrrSfLD2uaFEGTM9EUsG3E,\
        SUPABASE_BUCKET=uploads,\
        FIREBASE_PROJECT_ID=legal-ai-f8b0b,\
        FIREBASE_STORAGE_BUCKET=legal-ai-f8b0b.appspot.com
