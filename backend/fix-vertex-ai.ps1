#!/usr/bin/env pwsh
# Fix Vertex AI Configuration Script

Write-Host "🔧 Fixing Vertex AI Configuration..." -ForegroundColor Cyan

# Set Google Cloud Project ID environment variable
$PROJECT_ID = Read-Host "Enter your Google Cloud Project ID"
if (-not $PROJECT_ID) {
    Write-Host "❌ Project ID is required" -ForegroundColor Red
    exit 1
}

Write-Host "📝 Setting environment variables..." -ForegroundColor Yellow

# Update the backend service with required environment variables
gcloud run services update legal-ai-backend `
    --region=us-central1 `
    --update-env-vars="GCP_PROJECT_ID=$PROJECT_ID,GOOGLE_CLOUD_PROJECT=$PROJECT_ID"

Write-Host "🧪 Testing Vertex AI connectivity..." -ForegroundColor Yellow

# Test the health endpoint
$healthResponse = curl -s "https://legal-ai-backend-63563783552.us-central1.run.app/health"
Write-Host "Health check: $healthResponse" -ForegroundColor Green

Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "1. The backend has been updated with proper project ID"
Write-Host "2. Vertex AI should now work with the default Cloud Run service account"
Write-Host "3. Test document processing from the frontend"
Write-Host ""
Write-Host "If you still get errors, you may need to:"
Write-Host "- Enable the Vertex AI API in your Google Cloud Console"
Write-Host "- Ensure the Cloud Run service account has Vertex AI permissions"

Write-Host "✅ Configuration update complete!" -ForegroundColor Green