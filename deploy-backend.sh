#!/bin/bash

# Deploy Backend to Google Cloud Run
echo "🚀 Deploying Backend to Google Cloud Run..."

cd backend

# Deploy to Cloud Run
gcloud run deploy legal-ai-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="SUPABASE_URL=https://fvxufvgrctqhjonxtrkn.supabase.co,FIREBASE_PROJECT_ID=legal-ai-f8b0b,GOOGLE_CLOUD_PROJECT=legal-ai-f8b0b" \
  --timeout=300 \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10 \
  --min-instances=0

echo "✅ Backend deployed successfully!"

# Get the service URL
SERVICE_URL=$(gcloud run services describe legal-ai-backend --region=us-central1 --format="value(status.url)")
echo "🔗 Backend URL: $SERVICE_URL"

cd ..