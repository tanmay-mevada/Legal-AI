# PowerShell deployment script
Write-Host "🚀 Deploying Legal AI Application..." -ForegroundColor Green

# Function to check if command exists
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

if (!(Test-Command "gcloud")) {
    Write-Host "❌ Google Cloud CLI not found. Please install from: https://cloud.google.com/sdk" -ForegroundColor Red
    exit 1
}

if (!(Test-Command "firebase")) {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g firebase-tools
}

if (!(Test-Command "npm")) {
    Write-Host "❌ Node.js/npm not found. Please install from: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Deploy Backend
Write-Host "🚀 Deploying Backend..." -ForegroundColor Green
Set-Location backend

$backendResult = & gcloud run deploy legal-ai-backend `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars="SUPABASE_URL=https://fvxufvgrctqhjonxtrkn.supabase.co,FIREBASE_PROJECT_ID=legal-ai-f8b0b,GCP_PROJECT_ID=legal-ai-f8b0b,GOOGLE_CLOUD_PROJECT=legal-ai-f8b0b" `
  --timeout=300 `
  --memory=2Gi `
  --cpu=2 `
  --max-instances=10

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend deployment failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green

# Get backend URL
$serviceUrl = & gcloud run services describe legal-ai-backend --region=us-central1 --format="value(status.url)"
Write-Host "🔗 Backend URL: $serviceUrl" -ForegroundColor Cyan

Set-Location ..

# Deploy Frontend
Write-Host "🚀 Deploying Frontend..." -ForegroundColor Green
Set-Location frontend

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Update API URL in env file if backend URL is available
if ($serviceUrl) {
    Write-Host "🔧 Updating API URL..." -ForegroundColor Yellow
    $envContent = "NEXT_PUBLIC_API_URL=$serviceUrl"
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
}

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please fix errors and try again." -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Deploy to Firebase
Write-Host "🌐 Deploying to Firebase..." -ForegroundColor Yellow
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "🔗 Backend: $serviceUrl" -ForegroundColor Cyan
Write-Host "🔗 Frontend: Check Firebase console for URL" -ForegroundColor Cyan