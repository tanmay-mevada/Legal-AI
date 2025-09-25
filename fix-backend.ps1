# PowerShell script to fix the 500 error by setting missing environment variables

Write-Host "🔧 Fixing Cloud Run Environment Variables..." -ForegroundColor Green

# Check if user is logged in to gcloud
$gcloudCheck = & gcloud config get-value account 2>$null
if (-not $gcloudCheck) {
    Write-Host "❌ You need to login to gcloud first:" -ForegroundColor Red
    Write-Host "   gcloud auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ gcloud authenticated as: $gcloudCheck" -ForegroundColor Green

# Ask user for Supabase service role key
Write-Host ""
Write-Host "🔑 We need your Supabase Service Role Key" -ForegroundColor Yellow
Write-Host "   1. Go to: https://app.supabase.com/project/_/settings/api" -ForegroundColor Cyan
Write-Host "   2. Copy the 'service_role' key (not the anon key!)" -ForegroundColor Cyan
Write-Host ""
$serviceRoleKey = Read-Host "Paste your Supabase service_role key here"

if (-not $serviceRoleKey -or $serviceRoleKey.Length -lt 50) {
    Write-Host "❌ Invalid key. The service role key should be long (100+ characters)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Setting environment variables in Cloud Run..." -ForegroundColor Green

# Set the environment variables
try {
    & gcloud run services update legal-ai-backend `
        --region=us-central1 `
        --update-env-vars="SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey,GCP_PROJECT_ID=legal-ai-f8b0b"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Environment variables updated successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔄 Testing the backend..." -ForegroundColor Yellow
        
        # Test the health endpoint
        try {
            $response = Invoke-RestMethod -Uri "https://legal-ai-backend-63563783552.us-central1.run.app/health" -Method GET
            Write-Host "✅ Backend is healthy!" -ForegroundColor Green
            Write-Host "   Status: $($response.status)" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "🎉 Your backend is now fixed! Try uploading a document again." -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Backend updated but health check failed. It may take a moment to restart." -ForegroundColor Yellow
            Write-Host "   Try again in 30 seconds." -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Failed to update environment variables" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error updating Cloud Run service: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor White
Write-Host "   1. Wait 30 seconds for the service to restart" -ForegroundColor Cyan
Write-Host "   2. Try uploading a document in your app" -ForegroundColor Cyan
Write-Host "   3. Document processing should now work!" -ForegroundColor Cyan