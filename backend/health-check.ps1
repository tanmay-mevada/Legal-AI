#!/usr/bin/env pwsh
# Quick Backend Health Check Script

Write-Host "🧪 Legal AI Backend Health Check" -ForegroundColor Cyan

$BASE_URL = "https://legal-ai-backend-63563783552.us-central1.run.app"

# Test 1: Health Endpoint
Write-Host "1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = curl -s "$BASE_URL/health" | ConvertFrom-Json
    if ($healthResponse.status -eq "healthy") {
        Write-Host "   ✅ Health check passed: $($healthResponse.status)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Health check failed: $healthResponse" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Health endpoint not responding" -ForegroundColor Red
}

# Test 2: Check Recent Logs
Write-Host "2. Checking recent logs for errors..." -ForegroundColor Yellow
$errorLogs = gcloud run services logs read legal-ai-backend --region=us-central1 --limit=10 | Select-String -Pattern "error|Error|ERROR|Exception|FAILED"

if ($errorLogs) {
    Write-Host "   ⚠️  Found recent errors:" -ForegroundColor Yellow
    $errorLogs | ForEach-Object { Write-Host "     $_" -ForegroundColor Red }
} else {
    Write-Host "   ✅ No recent errors found" -ForegroundColor Green
}

# Test 3: Check Vertex AI Status
Write-Host "3. Checking Vertex AI status..." -ForegroundColor Yellow
$vertexLogs = gcloud run services logs read legal-ai-backend --region=us-central1 --limit=5 | Select-String -Pattern "Vertex AI"

if ($vertexLogs) {
    $latestVertexStatus = $vertexLogs | Select-Object -First 1
    if ($latestVertexStatus -match "successfully imported") {
        Write-Host "   ✅ Vertex AI: Successfully imported and configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Vertex AI: $latestVertexStatus" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ No Vertex AI logs found" -ForegroundColor Red
}

# Test 4: API Documentation
Write-Host "4. Testing API documentation endpoint..." -ForegroundColor Yellow
try {
    $docsResponse = curl -s "$BASE_URL/docs" -w "%{http_code}"
    if ($docsResponse -match "200$") {
        Write-Host "   ✅ API docs available at: $BASE_URL/docs" -ForegroundColor Green
    } else {
        Write-Host "   ❌ API docs not accessible" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ API docs endpoint not responding" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "🎯 Health Check Summary:" -ForegroundColor Cyan
Write-Host "   Backend URL: $BASE_URL" -ForegroundColor Gray
Write-Host "   Region: us-central1" -ForegroundColor Gray
Write-Host "   Project: legal-ai-f8b0b" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Your backend should now be ready for document processing!" -ForegroundColor Green
Write-Host "   Try uploading a document from your frontend application." -ForegroundColor Yellow