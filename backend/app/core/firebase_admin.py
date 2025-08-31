import firebase_admin
from firebase_admin import credentials, auth
import os

if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
    cred = credentials.ApplicationDefault()
else:
    cred = credentials.Certificate("D:/legal-ai/legal-ai/backend/serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    "storageBucket": "your-project-id.appspot.com"
})