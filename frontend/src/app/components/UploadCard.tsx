"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getAuth } from "firebase/auth";

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

    // Sanitize file name for Supabase Storage
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `user-files/${safeName}`;

    // Try upload
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) {
      // If resource exists, handle re-upload logic
      if (error.message && error.message.includes("already exists")) {
        setStatus("File already exists. Checking status...");
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setUploading(false);
          setStatus("User not logged in (Firebase)");
          return;
        }
        const token = await user.getIdToken();
        // Find document by bucket_path
  const docRes = await fetch(`https://fastapi-app-63563783552.us-east1.run.app/api/documents/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const docList = await docRes.json();
        type Document = {
          id: string;
          file_name: string;
          bucket_path: string;
          status: string;
        };
        const found = docList.documents?.find((d: Document) => d.bucket_path === path);
        if (!found) {
          setUploading(false);
          setStatus("File exists in storage but not in database. Please contact support or try a different file.");
          return;
        }
        if (found.status === "processed") {
          setStatus("File already processed. Showing chat...");
          onUploaded({ docId: found.id, fileName: found.file_name, bucketPath: found.bucket_path });
        } else {
          setStatus("File exists but not processed. Processing now...");
          // Trigger processing
          const processRes = await fetch(`https://fastapi-app-63563783552.us-east1.run.app/api/documents/${found.id}/process`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const processData = await processRes.json();
          if (processRes.ok) {
            setStatus("File processed. Showing chat...");
            onUploaded({ docId: found.id, fileName: found.file_name, bucketPath: found.bucket_path });
          } else {
            setStatus("Processing failed: " + (processData.detail || "unknown error"));
          }
        }
        setUploading(false);
        return;
      } else {
        setUploading(false);
        setStatus("Upload failed: " + error.message);
        return;
      }
    }

    // Normal upload flow
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setUploading(false);
      setStatus("User not logged in (Firebase)");
      return;
    }

    const token = await user.getIdToken();
  const res = await fetch("https://fastapi-app-63563783552.us-east1.run.app/api/documents/", {
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
    if (data && data.document && data.document.id) {
      onUploaded({ docId: data.document.id, fileName: file.name, bucketPath: path });
      setStatus("Upload complete. Ready to process.");
    } else {
      setStatus("Upload succeeded, but no document ID returned.");
    }
    setUploading(false);
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


