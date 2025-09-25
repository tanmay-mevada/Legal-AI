@echo off
REM Deploy Backend to Google Cloud Run (Windows)

echo 🚀 Deploying Backend to Google Cloud Run...

cd backend

REM Deploy to Cloud Run
gcloud run deploy legal-ai-backend ^
  --source . ^
  --platform managed ^
  --region us-central1 ^
  --allow-unauthenticated ^
  --set-env-vars="SUPABASE_URL=https://fvxufvgrctqhjonxtrkn.supabase.co,FIREBASE_PROJECT_ID=legal-ai-f8b0b,GOOGLE_CLOUD_PROJECT=legal-ai-f8b0b,GCP_PROJECT_ID=legal-ai-f8b0b" ^
  --timeout=300 ^
  --memory=2Gi ^
  --cpu=2 ^
  --max-instances=10 ^
  --min-instances=0

echo ✅ Backend deployed successfully!

cd ..