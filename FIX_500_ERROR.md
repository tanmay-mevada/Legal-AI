## 🚨 Fixing the 500 Error - Quick Solution

The 500 error is happening because of missing environment variables. Here's how to fix it:

### Step 1: Get Your Supabase Service Role Key

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `legal-ai-f8b0b`
3. Go to **Settings** > **API**
4. Copy the **service_role** key (not the anon key!)

### Step 2: Set the Environment Variable in Cloud Run

Run this command with YOUR actual Supabase service role key:

```bash
gcloud run services update legal-ai-backend \
  --region=us-central1 \
  --update-env-vars="SUPABASE_SERVICE_ROLE_KEY=YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE"
```

Replace `YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE` with the key you copied from step 1.

### Step 3: Also Set GCP Project ID

```bash
gcloud run services update legal-ai-backend \
  --region=us-central1 \
  --update-env-vars="GCP_PROJECT_ID=legal-ai-f8b0b"
```

### Step 4: Restart the Service

```bash
gcloud run services update legal-ai-backend \
  --region=us-central1 \
  --max-instances=10
```

### Alternative: Quick Deploy with All Variables

Edit the `deploy-backend.bat` file and add your Supabase service role key, then run:

```bash
.\deploy-backend.bat
```

### 🔍 Check if it's Working

After setting the environment variables, test the backend:

```bash
curl "https://legal-ai-backend-63563783552.us-central1.run.app/health"
```

You should get a response like:
```json
{"status": "healthy", "service": "Legal AI Backend"}
```

### 📋 Environment Variables Needed

Your Cloud Run service needs these variables:
- ✅ `SUPABASE_URL` (already set)
- ✅ `FIREBASE_PROJECT_ID` (already set) 
- ❌ `SUPABASE_SERVICE_ROLE_KEY` (MISSING - this is causing the error!)
- ❌ `GCP_PROJECT_ID` (MISSING - needed for Document AI)

### 🚀 Test Document Processing

Once you've set the missing environment variables, try uploading a document again. The processing should work!

If you're still getting errors, check the logs:
```bash
gcloud run services logs read legal-ai-backend --region=us-central1 --limit=10
```