from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.upload import router as upload_router
from app.api.documents import router as documents_router
from app.api.admin import router as admin_router
from app.api.user_activity import router as activity_router
from app.api import process

app = FastAPI()

app.include_router(process.router, prefix="/process", tags=["process"])
app.include_router(upload_router, prefix="/upload", tags=["upload"])
app.include_router(documents_router, prefix="/api/documents", tags=["documents"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(activity_router, prefix="/api/activity", tags=["activity"])

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def read_root():
    return {"message": "Hello, Legal AI is running 🚀"}