import os
import time
import requests
import pdfplumber
from datetime import datetime
from supabase import create_client
import openai
import io

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
openai.api_key = os.getenv("OPENAI_API_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

BUCKET = "uploads"
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", 10))  # seconds

def fetch_next_queued():
    res = supabase.table("documents").select("*").eq("status", "queued").limit(1).execute()
    if not res.data:
        return None
    return res.data[0]

def set_status(doc_id, status):
    supabase.table("documents").update({"status": status}).eq("id", doc_id).execute()

def create_signed_url_for_doc(path, expires_in=600):
    signed = supabase.storage.from_(BUCKET).create_signed_url(path, expires_in)
    signed_url = signed.get("signed_url") if isinstance(signed, dict) else signed
    return signed_url

def download_file(url):
    r = requests.get(url)
    r.raise_for_status()
    return r.content

def extract_text_from_pdf_bytes(pdf_bytes):
    text = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text.append(page_text)
    return "\n\n".join(text)

def summarize_text_with_openai(text):
    prompt = (
        "You are a helpful assistant that summarizes legal agreements in plain English and lists key risks. "
        "Produce a short executive summary (5 bullets) and then list any risky clauses as bullets. Keep numbers exact."
        f"\n\nDOCUMENT:\n{text[:30000]}"
    )
    resp = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role":"system","content":"You are a legal explainer (not a lawyer)."}, {"role":"user","content":prompt}],
        max_tokens=800,
        temperature=0.0
    )
    return resp.choices[0].message.content.strip()

def process_document(doc):
    doc_id = doc["id"]
    path = doc["bucket_path"]
    try:
        set_status(doc_id, "processing")
        signed_url = create_signed_url_for_doc(path, expires_in=600)
        file_bytes = download_file(signed_url)
        if path.lower().endswith(".pdf"):
            text = extract_text_from_pdf_bytes(file_bytes)
        else:
            text = file_bytes.decode(errors="ignore")
        summary = summarize_text_with_openai(text)
        supabase.table("documents").update({
            "status": "summarized",
            "summary": summary,
            "processed_at": datetime.utcnow().isoformat()
        }).eq("id", doc_id).execute()
        print(f"Processed {doc_id}")
    except Exception as e:
        print("Processing error:", e)
        supabase.table("documents").update({
            "status": "failed"
        }).eq("id", doc_id).execute()

if __name__ == "__main__":
    print("Worker started...")
    while True:
        doc = fetch_next_queued()
        if doc:
            process_document(doc)
        else:
            time.sleep(POLL_INTERVAL)
