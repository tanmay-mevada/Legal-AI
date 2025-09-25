# 🚀 Quick Deployment Steps

## Step 1: Setup (One-time)

### Install Required Tools:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Install Google Cloud CLI
# Download from: https://cloud.google.com/sdk
```

### Login to Services:
```bash
# Login to Firebase
firebase login

# Login to Google Cloud
gcloud auth login
gcloud config set project legal-ai-f8b0b
```

## Step 2: Deploy Backend (FastAPI)

### Option A: Using PowerShell Script (Recommended for Windows)
```powershell
# Run from the main project directory
.\deploy-backend.bat
```

### Option B: Manual Commands
```bash
cd backend
gcloud run deploy legal-ai-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="SUPABASE_URL=https://fvxufvgrctqhjonxtrkn.supabase.co,FIREBASE_PROJECT_ID=legal-ai-f8b0b" \
  --timeout=300
```

**📝 Note the backend URL from the deployment output!**

## Step 3: Deploy Frontend (Next.js)

### Update Frontend Environment:
1. Go to `frontend/.env.local`
2. Update `NEXT_PUBLIC_API_URL` with your backend URL from Step 2

### Option A: Using npm Scripts
```bash
cd frontend
npm run deploy
```

### Option B: Using Batch Script
```powershell
# Run from the main project directory
.\deploy-frontend.bat
```

### Option C: Manual Commands
```bash
cd frontend
npm install
npm run build
firebase deploy --only hosting
```

## Step 4: Full Deployment (Both Backend + Frontend)

### Option A: Complete PowerShell Script
```powershell
# Run from the main project directory
.\deploy.ps1
```

This will:
1. Check all prerequisites
2. Deploy backend to Cloud Run
3. Update frontend with backend URL
4. Build and deploy frontend to Firebase

## 🔧 Environment Variables Checklist

### Backend (Set in Cloud Run):
- ✅ `SUPABASE_URL` (already set)
- ✅ `FIREBASE_PROJECT_ID` (already set)
- ❓ `SUPABASE_SERVICE_KEY` (you may need this)
- ❓ `GOOGLE_APPLICATION_CREDENTIALS` (for Document AI)

### Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=https://your-backend-url-here
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=legal-ai-f8b0b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=legal-ai-f8b0b
NEXT_PUBLIC_SUPABASE_URL=https://fvxufvgrctqhjonxtrkn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎯 Quick Commands

### Deploy Everything:
```powershell
.\deploy.ps1
```

### Deploy Only Backend:
```powershell
.\deploy-backend.bat
```

### Deploy Only Frontend:
```powershell
.\deploy-frontend.bat
```

### Or from frontend directory:
```bash
cd frontend
npm run deploy
```

## 🔍 Troubleshooting

### Common Issues:

1. **"gcloud not found"**: Install Google Cloud CLI
2. **"firebase not found"**: Run `npm install -g firebase-tools`
3. **Build errors**: Fix TypeScript/syntax errors first
4. **Authentication errors**: Make sure you're logged in with `firebase login` and `gcloud auth login`

### Check Deployment Status:
```bash
# Backend logs
gcloud run logs tail legal-ai-backend --region=us-central1

# Firebase hosting info
firebase hosting:sites:list
```

## 📱 Access Your App

After successful deployment:

- **Frontend**: `https://legal-ai-f8b0b.web.app` (or your custom domain)
- **Backend**: `https://legal-ai-backend-xxxx-uc.a.run.app`

## 🔄 Updating Your App

For future updates, just run:
```powershell
.\deploy.ps1
```

This will redeploy both backend and frontend with your latest changes!