@echo off
REM Set environment variables for the existing Cloud Run service

echo 🔧 Setting environment variables for legal-ai-backend...

REM You need to replace these with your actual values:
REM - YOUR_SUPABASE_SERVICE_ROLE_KEY: Get from Supabase Dashboard > Settings > API
REM - YOUR_GOOGLE_CREDENTIALS: Path to your service account JSON file

REM Set environment variables
gcloud run services update legal-ai-backend ^
  --region=us-central1 ^
  --set-env-vars="SUPABASE_URL=https://fvxufvgrctqhjonxtrkn.supabase.co,FIREBASE_PROJECT_ID=legal-ai-f8b0b,GCP_PROJECT_ID=legal-ai-f8b0b,GOOGLE_CLOUD_PROJECT=legal-ai-f8b0b,SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE"

echo ✅ Environment variables updated!
echo ⚠️  Don't forget to replace YOUR_SUPABASE_SERVICE_ROLE_KEY with your actual Supabase service role key!
echo 📝 Get it from: Supabase Dashboard > Settings > API > service_role key

cd ..