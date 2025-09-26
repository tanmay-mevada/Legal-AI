# Legal AI Deployment Guide

## Overview
Your Legal AI application consists of:
- **Frontend**: Next.js app → Deploy to Firebase Hosting
- **Backend**: FastAPI Python app → Deploy to Google Cloud Run
- **Database**: Supabase (already hosted)
- **Storage**: Supabase Storage (already hosted)

## Prerequisites

### 1. Install Required Tools
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Install Google Cloud CLI
# Download from: https://cloud.google.com/sdk
```

### 2. Login to Services
```bash
# Login to Firebase
firebase login

# Login to Google Cloud
gcloud auth login
gcloud config set project legal-ai-f8b0b
```

## Backend Deployment (FastAPI to Cloud Run)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Deploy to Cloud Run
```bash
gcloud run deploy legal-ai-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="SUPABASE_URL=https://fvxufvgrctqhjonxtrkn.supabase.co,FIREBASE_PROJECT_ID=legal-ai-f8b0b,GOOGLE_CLOUD_PROJECT=legal-ai-f8b0b" \
  --timeout=300 \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10
```

### 3. Note the Backend URL
After deployment, you'll get a URL like:
```
https://legal-ai-backend-xxxx-uc.a.run.app
```

## Frontend Deployment (Next.js to Firebase Hosting)

### 1. Navigate to Frontend Directory
```bash
cd ../frontend
```

### 2. Update Environment Variables
Create/update `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://legal-ai-backend-xxxx-uc.a.run.app
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=legal-ai-f8b0b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=legal-ai-f8b0b
NEXT_PUBLIC_SUPABASE_URL=https://fvxufvgrctqhjonxtrkn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Build and Deploy
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

## Quick Deploy Scripts

### Backend Quick Deploy
```bash
#!/bin/bash
cd backend
gcloud run deploy legal-ai-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="SUPABASE_URL=https://fvxufvgrctqhjonxtrkn.supabase.co,FIREBASE_PROJECT_ID=legal-ai-f8b0b" \
  --timeout=300
```

### Frontend Quick Deploy
```bash
#!/bin/bash
cd frontend
npm install
npm run build
firebase deploy --only hosting
```

## Environment Variables Checklist

### Backend (.env or Cloud Run env vars):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `FIREBASE_PROJECT_ID`
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_APPLICATION_CREDENTIALS` (for Document AI)

### Frontend (.env.local):
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your backend allows your frontend domain
2. **Authentication Errors**: Check Firebase config and Supabase keys
3. **Build Errors**: Fix any TypeScript/syntax errors before deploying
4. **Memory Issues**: Increase Cloud Run memory allocation if needed

### Logs:
```bash
# Backend logs
gcloud run logs tail legal-ai-backend --region=us-central1

# Frontend logs
firebase hosting:channel:open <channel-id>
```

## Custom Domain (Optional)

### For Frontend:
```bash
firebase hosting:sites:create your-domain-name
firebase target:apply hosting production your-domain-name
firebase deploy --only hosting:production
```

### For Backend:
```bash
gcloud run domain-mappings create \
  --service legal-ai-backend \
  --domain api.yourdomain.com \
  --region us-central1
```

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: google-github-actions/setup-gcloud@v0
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: legal-ai-f8b0b
      
      - name: Deploy to Cloud Run
        run: |
          cd backend
          gcloud run deploy legal-ai-backend \
            --source . \
            --platform managed \
            --region us-central1 \
            --allow-unauthenticated

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install and Deploy
        run: |
          cd frontend
          npm install
          npm run build
          npm install -g firebase-tools
          firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
```

## Monitoring

### Set up monitoring:
```bash
# Enable Cloud Run monitoring
gcloud run services update legal-ai-backend \
  --region=us-central1 \
  --cpu-throttling \
  --execution-environment=gen2

# Firebase Performance Monitoring
# Add to your Next.js app
npm install firebase
```

## Cost Optimization

1. **Cloud Run**: Enable CPU throttling, set min instances to 0
2. **Firebase Hosting**: Use caching headers
3. **Supabase**: Monitor usage and optimize queries

## Security

1. **Environment Variables**: Never commit secrets
2. **CORS**: Configure properly for production
3. **Authentication**: Use Firebase Auth tokens
4. **Rate Limiting**: Implement in Cloud Run
5. **Supabase RLS**: Enable Row Level Security

## Final Steps

1. Test all functionality in production
2. Set up monitoring and alerts
3. Configure custom domain (optional)
4. Set up SSL certificates
5. Enable CDN for better performance

Your application will be available at:
- Frontend: `https://your-project.web.app`
- Backend: `https://legal-ai-backend-xxxx-uc.a.run.app`