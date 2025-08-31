from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from firebase_admin import storage, firestore
from app.api.auth import get_current_user
import datetime

router = APIRouter()

@router.post("/api/upload", status_code=status.HTTP_201_CREATED)
async def upload_file(
	file: UploadFile = File(...),
	user=Depends(get_current_user)
):
	# Save file to Firebase Storage
	bucket = storage.bucket()
	blob = bucket.blob(f"user_uploads/{user['uid']}/{file.filename}")
	content = await file.read()
	blob.upload_from_string(content, content_type=file.content_type)
	blob.make_private()

	# Store metadata in Firestore
	db = firestore.client()
	doc_ref = db.collection("documents").document()
	doc_ref.set({
		"owner": user["uid"],
		"filename": file.filename,
		"uploadedAt": datetime.datetime.utcnow().isoformat(),
		"storagePath": blob.name,
	})
	return {"message": "File uploaded successfully", "docId": doc_ref.id}
