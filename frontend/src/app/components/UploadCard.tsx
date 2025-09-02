"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getAuth } from "firebase/auth";

type Props = {
  onUploaded: (args: { docId: string; fileName: string }) => void;
  onStatus?: (msg: string) => void;
};

export default function UploadCard({ onUploaded, onStatus }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const setStatus = (m: string) => onStatus?.(m);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setStatus("Uploading...");

    const path = `user-files/${file.name}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) {
      setUploading(false);
      setStatus("Upload failed: " + error.message);
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setUploading(false);
      setStatus("User not logged in (Firebase)");
      return;
    }

    const token = await user.getIdToken();
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
      setUploading(false);
      setStatus("Metadata insert failed: " + (data.detail || "unknown error"));
      return;
    }

    onUploaded({ docId: data.document.id, fileName: file.name });
    setStatus("Upload complete. Ready to process.");
    setUploading(false);
  };

  return (
    <div className="p-6 border glass-morphism rounded-2xl border-slate-200 dark:border-dark-700/50 bg-white/60 dark:bg-transparent">
      <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">Upload a document</h3>
      <form onSubmit={handleUpload} className="flex flex-col gap-3">
        <label className="flex flex-col items-center justify-center gap-2 p-6 transition border-2 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50 border-slate-300 text-slate-600 dark:bg-dark-900/60 dark:hover:bg-dark-900 dark:border-dark-700/60 dark:text-dark-300">
          <span className="text-sm">Drop your file here or click to browse</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-dark-300 truncate">
            {file ? file.name : "No file selected"}
          </div>
          <button
            type="submit"
            disabled={!file || uploading}
            className="px-4 py-2 text-white transition rounded bg-primary-600 hover:bg-primary-500 disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </div>
  );
}


