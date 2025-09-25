import os
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()  # Load .env from current directory
logger.info("Environment variables loaded")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
try:
    from app.api.upload import router as upload_router
    from app.api.documents import router as documents_router
    from app.api.admin import router as admin_router
    from app.api.user_activity import router as activity_router
    from app.api import process
    logger.info("All routers imported successfully")
except Exception as e:
    logger.error(f"Failed to import routers: {e}")
    raise

app = FastAPI(title="Legal AI API", version="1.0.0")

# Include your API routers
try:
    app.include_router(process.router, prefix="/process", tags=["process"])
    app.include_router(upload_router, prefix="/upload", tags=["upload"])
    app.include_router(documents_router, prefix="/api/documents", tags=["documents"])
    app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
    app.include_router(activity_router, prefix="/api/activity", tags=["activity"])
    logger.info("All routers registered successfully")
except Exception as e:
    logger.error(f"Failed to register routers: {e}")
    raise

# Configure CORS middleware
origins = [
    "http://localhost:3000",
    "https://legal-ai-f8b0b.web.app",
    "https://legal-ai-f8b0b.firebaseapp.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def read_root():
    return {"message": "Hello, Legal AI is running", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Legal AI Backend"}

# ADD THIS SECTION FOR CLOUD RUN
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)