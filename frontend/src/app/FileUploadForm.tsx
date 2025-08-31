"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getAuth } from "firebase/auth";

export default function FileUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [docId, setDocId] = useState<string | null>(null); // ✅ store backend doc_id
  const [processing, setProcessing] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus("Uploading...");

    const path = `user-files/${file.name}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);

    if (error) {
      setStatus("Upload failed: " + error.message);
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setStatus("User not logged in (Firebase)");
      return;
    }

    const token = await user.getIdToken(); // 🔑 Firebase token

    const res = await fetch("http://127.0.0.1:8000/api/documents/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        file_name: file.name,
        bucket_path: path,
        content_type: file.type,
        size_bytes: file.size,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setStatus("Metadata insert failed: " + (data.detail || "unknown error"));
      return;
    }

    setDocId(data.document.id);
    setStatus("Upload and metadata saved!");
  };

  const handleProcess = async () => {
    if (!docId) return;
    setProcessing(true);
    setStatus("Processing document...");

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setStatus("User not logged in (Firebase)");
      setProcessing(false);
      return;
    }

    const token = await user.getIdToken();

    const res = await fetch(
      `http://127.0.0.1:8000/api/documents/${docId}/process`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    if (!res.ok) {
      setStatus("Processing failed: " + (data.detail || "unknown error"));
    } else {
      setStatus("Processing done! Extracted text saved.");
    }
    setProcessing(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          disabled={!file}
          className="px-4 py-2 text-white transition bg-green-500 rounded hover:bg-green-600"
        >
          Upload
        </button>
      </form>

      {/* Show process button only after upload */}
      {docId && (
        <button
          onClick={handleProcess}
          disabled={processing}
          className="px-4 py-2 text-white transition bg-blue-500 rounded hover:bg-blue-600"
        >
          {processing ? "Processing..." : "Process Document"}
        </button>
      )}

      {status && <div className="text-sm text-gray-600">{status}</div>}
    </div>
  );
}
