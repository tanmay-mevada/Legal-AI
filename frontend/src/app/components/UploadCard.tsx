"use client";
import { useState } from "react";
import { getAuth } from "firebase/auth";
import { buildApiUrl } from "@/lib/config";

type Props = {
  onUploaded: (args: { docId: string; fileName: string; bucketPath: string }) => void;
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

    // Use backend upload endpoint for reliable uploads
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setUploading(false);
      setStatus("User not logged in (Firebase)");
      return;
    }

    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      const uploadUrl = buildApiUrl("/api/upload");
      console.log("DEBUG: Using upload URL:", uploadUrl);
      setStatus(`Uploading to: ${uploadUrl}...`);

      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) {
        setUploading(false);
        setStatus(`Upload failed: ${uploadData.detail || 'Unknown error'}`);
        return;
      }

      // Upload successful
      setStatus("Upload complete. Ready to process.");
      onUploaded({ 
        docId: uploadData.document.id, 
        fileName: uploadData.document.file_name, 
        bucketPath: uploadData.document.bucket_path 
      });
      setUploading(false);

    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
      setStatus(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-6 border glass-morphism rounded-2xl border-slate-200 dark:border-dark-700/50 bg-white/60 dark:bg-transparent">
      <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">Upload a document</h3>
      <form onSubmit={handleUpload} className="flex flex-col gap-3">
        <label className="flex flex-col items-center justify-center gap-2 p-6 transition bg-white border-2 border-dashed cursor-pointer rounded-xl hover:bg-slate-50 border-slate-300 text-slate-600 dark:bg-dark-900/60 dark:hover:bg-dark-900 dark:border-dark-700/60 dark:text-dark-300">
          <span className="text-sm">Drop your file here or click to browse</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs truncate text-slate-500 dark:text-dark-300">
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


