import os, time
from datetime import datetime
from supabase import create_client
from app.core.documentai_client import process_bytes
from app.core.chunking import split_text

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BUCKET = os.getenv("SUPABASE_BUCKET", "uploads")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_next_queued():
    res = supabase.table("documents").select("*").eq("status", "queued").limit(1).execute()
    if res.error or not res.data:
        return None
    return res.data[0]

def set_status(doc_id, status):
    supabase.table("documents").update({"status": status}).eq("id", doc_id).execute()

def download_from_supabase(path: str) -> bytes:
    # service role key can download directly
    data = supabase.storage.from_(BUCKET).download(path)
    # depending on client version, you may need: data = data  OR data = data.get("data")
    return data

def store_chunks(document_id: str, text: str):
    chunks = split_text(text)
    rows = [{"document_id": document_id, "chunk_index": i, "content": c} for i, c in enumerate(chunks)]
    # insert in batches if large
    if rows:
        supabase.table("document_chunks").insert(rows).execute()
    return len(rows)

def process_one(doc):
    doc_id = doc["id"]
    path = doc["bucket_path"]
    content_type = doc.get("content_type") or "application/pdf"

    try:
        set_status(doc_id, "processing")
        file_bytes = download_from_supabase(path)
        gdoc = process_bytes(file_bytes, content_type)
        text = gdoc.text or ""

        # Optional: parse entities (party names, dates, totals)
        # entities = [(e.type_, e.mention_text) for e in gdoc.entities] if gdoc.entities else []

        n_chunks = store_chunks(doc_id, text)

        supabase.table("documents").update({
            "status": "processed",
            "processed_at": datetime.utcnow().isoformat()
        }).eq("id", doc_id).execute()

        print(f"Processed {doc_id}: {n_chunks} chunks")
    except Exception as e:
        print("Error:", e)
        supabase.table("documents").update({"status": "failed"}).eq("id", doc_id).execute()

if __name__ == "__main__":
    print("DocAI worker started…")
    while True:
        job = fetch_next_queued()
        if job:
            process_one(job)
        else:
            time.sleep(5)
