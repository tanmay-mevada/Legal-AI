import os
from dotenv import load_dotenv
load_dotenv(dotenv_path="d:/legal-ai/legal-ai/backend/.env")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.upload import router as upload_router
from app.api.documents import router as documents_router
from app.api.admin import router as admin_router
from app.api.user_activity import router as activity_router
from app.api import process

app = FastAPI()

# Include your API routers
app.include_router(process.router, prefix="/process", tags=["process"])
app.include_router(upload_router, prefix="/upload", tags=["upload"])
app.include_router(documents_router, prefix="/api/documents", tags=["documents"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(activity_router, prefix="/api/activity", tags=["activity"])

# Configure CORS middleware
origins = [
    "http://localhost:3000",
    "https://legal-ai-f8b0b.web.app"
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
    return {"message": "Hello, Legal AI is running"}

# ADD THIS SECTION FOR CLOUD RUN
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)