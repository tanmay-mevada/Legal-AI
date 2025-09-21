"use client";
import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import type { Dispatch, SetStateAction } from "react";
import UploadCard from "./UploadCard";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface FileUploadFormProps {
  onSummary?: Dispatch<SetStateAction<string>>;
}

export default function FileUploadForm({ onSummary }: FileUploadFormProps) {
  const [status, setStatus] = useState<string>("");
  const [docId, setDocId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");

  // Clear any existing state when component mounts
  React.useEffect(() => {
    setStatus("");
    setDocId(null);
    setProcessing(false);
    setExtractedText("");
    setSummary("");
  }, []);

  // Automatically start processing after upload
  const handleUploaded = async ({ docId: id, fileName, bucketPath }: { docId: string; fileName: string; bucketPath: string }) => {
    console.log("handleUploaded called with:", { docId: id, fileName, bucketPath });
    setExtractedText("");
    setSummary("");
    setProcessing(true);
    setStatus("Processing...");

    // 1. Use the document ID that was already created by UploadCard
    const dbId = id; // Use the docId passed from UploadCard
    setDocId(dbId);
    console.log("Using document ID:", dbId);

    // 2. Start processing the document
    try {
      const token = await auth.currentUser?.getIdToken();
  const processRes = await fetch(`https://fastapi-app-63563783552.us-east1.run.app/api/documents/${dbId}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!processRes.ok) {
        setProcessing(false);
        setStatus("Failed to start processing");
        return;
      }
    } catch (error) {
      console.error("Error starting processing:", error);
      setProcessing(false);
      setStatus("Error starting processing");
      return;
    }

    // 3. Poll for status
    const poll = async () => {
      let done = false;
      let tries = 0;
      while (!done && tries < 60) {
        const token = await auth.currentUser?.getIdToken();
  const resp = await fetch(`https://fastapi-app-63563783552.us-east1.run.app/api/documents/${dbId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!resp.ok) {
          setProcessing(false);
          setStatus("Error fetching document status");
          return;
        }
        const { document } = await resp.json();
        if (document.status === "processed" || document.status === "failed") {
          setExtractedText(document.extracted_text || "");
          setSummary(document.summary || "");
          if (onSummary) onSummary(document.summary || "");
          setProcessing(false);
          setStatus(document.status === "processed" ? "Done" : "Failed to process");
          done = true;
        } else {
          setStatus("Processing...");
          await new Promise(r => setTimeout(r, 2000));
          tries++;
        }
      }
      if (!done) {
        setProcessing(false);
        setStatus("Timed out");
      }
    };
    await poll();
  };

  // No longer needed: handleProcessed

  return (
    <div className="flex flex-col w-full max-w-2xl gap-6 mx-auto">
      <div className="mb-4">
        <UploadCard onUploaded={handleUploaded} onStatus={setStatus} />
      </div>
      {docId && (
        <div className="flex flex-col gap-4">
          {/* User message bubble */}
          <div className="flex justify-end">
            <div className="rounded-2xl bg-blue-600 text-white px-4 py-3 max-w-[80%] shadow-md">
              <span className="font-medium">Uploaded file</span>
              <div className="mt-1 text-xs opacity-80">ID: {docId}</div>
            </div>
          </div>
          {/* AI processing bubble */}
          {processing && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-100 text-slate-700 px-4 py-3 max-w-[80%] shadow-md flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="font-medium">AI is processing your document...</span>
              </div>
            </div>
          )}
          {/* AI extracted text bubble */}
          {extractedText && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-100 text-slate-700 px-4 py-3 max-w-[80%] shadow-md">
                <span className="font-semibold text-blue-600">Extracted Text:</span>
                <div className="mt-2 text-sm whitespace-pre-line">{extractedText}</div>
              </div>
            </div>
          )}
          {/* AI summary bubble */}
          {summary && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-100 text-slate-700 px-4 py-3 max-w-[80%] shadow-md">
                <span className="font-semibold text-blue-600">AI Summary:</span>
                <div className="mt-2 text-sm">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
          {/* Status message */}
          {status && !processing && (
            <div className="flex justify-center">
              <span className="mt-2 text-xs text-slate-500">{status}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}