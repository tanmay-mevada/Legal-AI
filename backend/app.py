import os
from dotenv import load_dotenv
load_dotenv()  # Remove the hardcoded path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.upload import router as upload_router
from app.api.documents import router as documents_router
from app.api.admin import router as admin_router
from app.api.user_activity import router as activity_router
from app.api import process

app = FastAPI()

# ... rest of your code ...

@app.get("/")
def read_root():
    return {"message": "Hello, Legal AI is running"}

# Remove the uvicorn startup code from here