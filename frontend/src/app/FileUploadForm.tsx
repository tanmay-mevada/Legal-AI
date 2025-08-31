import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function FileUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setStatus("Uploading...");
    const path = `user-files/${file.name}`;
    const { error } = await supabase.storage
      .from("uploads")
      .upload(path, file);
    if (error) {
      setStatus("Upload failed: " + error.message);
    } else {
      // Store metadata in documents table
      // Get user info if available (replace with your auth logic)
      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
      const user_id = user ? user.id || user.email : "anonymous";
      const metadata = {
        user_id,
        file_name: file.name,
        bucket_path: path,
        content_type: file.type,
        size_bytes: file.size,
        pages: null, // Set if you extract page count
        status: "uploaded",
        summary: null,
        processed_at: null,
        created_at: new Date().toISOString(),
      };
      const { error: dbError } = await supabase
        .from("documents")
        .insert([metadata]);
      if (dbError) {
        setStatus("Upload succeeded, but DB insert failed: " + dbError.message);
      } else {
        setStatus("Upload and metadata saved!");
      }
    }
  };

  return (
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
      {status && <div className="text-sm text-gray-600">{status}</div>}
    </form>
  );
}