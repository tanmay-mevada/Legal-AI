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
    const { error } = await supabase.storage
      .from("uploads")
      .upload(`user-files/${file.name}`, file);
    if (error) {
      setStatus("Upload failed: " + error.message);
    } else {
      setStatus("Upload successful!");
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