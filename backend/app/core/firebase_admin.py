import firebase_admin
from firebase_admin import credentials, auth
import os

if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
    cred = credentials.ApplicationDefault()  # uses ADC if set in env
else:
    cred = credentials.Certificate("path/to/serviceAccountKey.json")

firebase_admin.initialize_app(cred)
