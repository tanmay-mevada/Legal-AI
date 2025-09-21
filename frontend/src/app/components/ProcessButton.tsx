"use client";
import { useState } from "react";
import { getAuth } from "firebase/auth";

type Props = {
  docId: string;
  onProcessed: (payload: { extractedText?: string; summary?: string }) => void;
  onStatus?: (msg: string) => void;
};

export default function ProcessButton({ docId, onProcessed, onStatus }: Props) {
  const [processing, setProcessing] = useState(false);
  const setStatus = (m: string) => onStatus?.(m);

  const handleProcess = async () => {
    setProcessing(true);
    setStatus("Processing document...");

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setProcessing(false);
      setStatus("User not logged in (Firebase)");
      return;
    }

    const token = await user.getIdToken();
  const res = await fetch(`https://fastapi-app-63563783552.us-east1.run.app/api/documents/${docId}/process`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) {
      setProcessing(false);
      setStatus("Processing failed: " + (data.detail || "unknown error"));
      return;
    }

    // Prefer response data; will still fetch full record for display later if needed
    onProcessed({ extractedText: data.extracted_text, summary: data.summary });
    setStatus("Processing done!");
    setProcessing(false);
  };

  return (
    <button
      onClick={handleProcess}
      disabled={processing}
      className="px-4 py-2 text-white transition rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
    >
      {processing ? "Processing..." : "Process Document"}
    </button>
  );
}


