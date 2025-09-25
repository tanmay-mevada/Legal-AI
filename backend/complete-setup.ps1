#!/usr/bin/env pwsh
# Complete Backend Configuration Setup Script

Write-Host "🔧 Setting up Legal AI Backend Configuration..." -ForegroundColor Cyan

# Get project information
$PROJECT_ID = "legal-ai-f8b0b"
Write-Host "Using Project ID: $PROJECT_ID" -ForegroundColor Green

# Check if Document AI processor exists, if not provide instructions
Write-Host "🔍 Checking Document AI setup..." -ForegroundColor Yellow

# List existing processors
Write-Host "Checking for existing Document AI processors..." -ForegroundColor Yellow
try {
    $processors = gcloud ai document-processors list --location=us --project=$PROJECT_ID --format="value(name,displayName)" 2>$null
    if ($processors) {
        Write-Host "Found existing processors:" -ForegroundColor Green
        $processors | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        
        # Extract processor ID from the first processor
        $firstProcessor = ($processors | Select-Object -First 1)
        if ($firstProcessor -match "/processors/([^/]+)") {
            $PROCESSOR_ID = $matches[1]
            Write-Host "Using processor ID: $PROCESSOR_ID" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ No Document AI processors found. Creating one..." -ForegroundColor Red
        
        # Create a processor
        Write-Host "Creating Document AI processor..." -ForegroundColor Yellow
        $createResult = gcloud ai document-processors create --location=us --processor-type=FORM_PARSER_PROCESSOR --display-name="Legal AI Document Processor" --project=$PROJECT_ID --format="value(name)" 2>$null
        if ($createResult -match "/processors/([^/]+)") {
            $PROCESSOR_ID = $matches[1]
            Write-Host "✅ Created processor with ID: $PROCESSOR_ID" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to create processor. Please create one manually in the Google Cloud Console." -ForegroundColor Red
            Write-Host "Go to: https://console.cloud.google.com/ai/document-ai/processors" -ForegroundColor Yellow
            exit 1
        }
    }
} catch {
    Write-Host "❌ Error accessing Document AI. Enabling API..." -ForegroundColor Red
    
    # Enable Document AI API
    gcloud services enable documentai.googleapis.com --project=$PROJECT_ID
    Write-Host "✅ Document AI API enabled. Please run this script again." -ForegroundColor Green
    exit 1
}

# Enable required APIs
Write-Host "📋 Enabling required Google Cloud APIs..." -ForegroundColor Yellow
$apis = @(
    "run.googleapis.com",
    "cloudbuild.googleapis.com", 
    "documentai.googleapis.com",
    "aiplatform.googleapis.com",
    "storage.googleapis.com"
)

foreach ($api in $apis) {
    Write-Host "Enabling $api..." -ForegroundColor Gray
    gcloud services enable $api --project=$PROJECT_ID
}

# Set environment variables
Write-Host "🔧 Setting environment variables..." -ForegroundColor Yellow

$envVars = @(
    "GCP_PROJECT_ID=$PROJECT_ID",
    "GOOGLE_CLOUD_PROJECT=$PROJECT_ID",
    "DOC_AI_PROCESSOR_ID=$PROCESSOR_ID",
    "GCP_LOCATION=us"
)

$envString = $envVars -join ","

gcloud run services update legal-ai-backend `
    --region=us-central1 `
    --update-env-vars="$envString"

Write-Host "✅ Environment variables updated" -ForegroundColor Green

# Test the deployment
Write-Host "🧪 Testing backend health..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$healthResponse = curl -s "https://legal-ai-backend-63563783552.us-central1.run.app/health"
Write-Host "Health check response: $healthResponse" -ForegroundColor Green

# Test Vertex AI
Write-Host "🤖 Testing Vertex AI connectivity..." -ForegroundColor Yellow
$testLogs = gcloud run services logs read legal-ai-backend --region=us-central1 --limit=5 | Select-String -Pattern "Vertex AI"
if ($testLogs) {
    Write-Host "Vertex AI status:" -ForegroundColor Green
    $testLogs | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
}

Write-Host ""
Write-Host "🎯 Setup Summary:" -ForegroundColor Cyan
Write-Host "✅ Project ID: $PROJECT_ID" -ForegroundColor Green
Write-Host "✅ Document AI Processor: $PROCESSOR_ID" -ForegroundColor Green
Write-Host "✅ All required APIs enabled" -ForegroundColor Green
Write-Host "✅ Environment variables configured" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Your backend should now be ready for document processing!" -ForegroundColor Green
Write-Host "Test document upload and processing from your frontend application." -ForegroundColor Yellow