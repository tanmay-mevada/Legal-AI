"use client";
import { useState } from "react";
import UploadCard from "./components/UploadCard";
import ProcessButton from "./components/ProcessButton";
import ResultTabs from "./components/ResultTabs";

export default function FileUploadForm() {
  const [status, setStatus] = useState<string>("");
  const [docId, setDocId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");

  const handleUploaded = ({ docId: id }: { docId: string; fileName: string }) => {
    setDocId(id);
    setExtractedText("");
    setSummary("");
  };

  const handleProcessed = ({ extractedText: t, summary: s }: { extractedText?: string; summary?: string }) => {
    if (typeof t === "string") setExtractedText(t);
    if (typeof s === "string") setSummary(s);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <UploadCard onUploaded={handleUploaded} onStatus={setStatus} />
        {docId && (
          <div className="flex items-center justify-between p-4 mt-4 border rounded-xl border-slate-200 dark:border-dark-700/60 bg-white/60 dark:bg-dark-900/60">
            <div className="text-xs text-slate-500 dark:text-dark-300 truncate max-w-[55%]">{docId}</div>
            <ProcessButton docId={docId} onProcessed={handleProcessed} onStatus={setStatus} />
          </div>
        )}
        {status && <div className="mt-3 text-xs text-slate-500 dark:text-gray-400">{status}</div>}
      </div>

      <div className="lg:col-span-2">
        <ResultTabs extractedText={extractedText} summary={summary} />
      </div>
    </div>
  );
}
