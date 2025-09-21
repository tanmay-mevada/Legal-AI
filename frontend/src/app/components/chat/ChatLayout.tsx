"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabaseClient";
// import { getAuth } from "firebase/auth";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import ResponsiveLayout from "../layout/ResponsiveLayout";

interface Document {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  extracted_text?: string;
  summary?: string;
  detailed_explanation?: string;
  processed_at?: string;
  bucket_path?: string;
  error_code?: string;
  error_message?: string;
  document_metadata?: {
    documentType?: string;
    complexity?: string;
    riskLevel?: "Low" | "Medium" | "High";
    riskFactors?: string[];
    wordCount?: number;
    pageCount?: number;
    keyParties?: string[];
  };
}

interface ChatLayoutProps {
  user: {
    uid: string;
    displayName?: string | null;
    email?: string | null;
  };
}

export default function ChatLayout({ user }: ChatLayoutProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user's documents
  const fetchDocuments = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
  const response = await fetch("https://fastapi-app-63563783552.us-east1.run.app/api/documents/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      // Sanitize file name for Supabase Storage
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `user-files/${safeName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage.from("uploads").upload(path, file);
      if (uploadError) {
        // Custom logic for 'resource already exists'
        if (uploadError.message && uploadError.message.includes("already exists")) {
          // Find document by bucket_path
          const token = await auth.currentUser?.getIdToken();
          const response = await fetch("https://fastapi-app-63563783552.us-east1.run.app/api/documents/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          const found = data.documents?.find((d: Document) => d.bucket_path === path);
          if (!found) {
            // User-friendly status message for this edge case
            setDocuments(prev => prev); // No change, but could trigger UI update if needed
            setSelectedDocumentId(null);
            setIsProcessing(false);
            // Optionally, set a status message in your UI (if you have a status setter)
            // Example: setStatus("File exists in storage but not in database. Please contact support or try a different file.");
            return;
          }
          if (found.status === "processed") {
            setSelectedDocumentId(found.id);
            setIsProcessing(false);
            return;
          } else {
            // Start processing
            const processResponse = await fetch(`https://fastapi-app-63563783552.us-east1.run.app/api/documents/${found.id}/process`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            if (!processResponse.ok) {
              console.error("Failed to start processing");
              setIsProcessing(false);
              return;
            }
            await pollForCompletion(found.id);
            setSelectedDocumentId(found.id);
            setIsProcessing(false);
            return;
          }
        } else {
          console.error("Upload failed:", uploadError.message);
          setIsProcessing(false);
          return;
        }
      }

      // Create document metadata
      const token = await auth.currentUser?.getIdToken();
  const response = await fetch("https://fastapi-app-63563783552.us-east1.run.app/api/documents/", {
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Document creation failed:", errorData.detail || "unknown error");
        setIsProcessing(false);
        return;
      }

      const { document } = await response.json();
      setDocuments(prev => [document, ...prev]);
      setSelectedDocumentId(document.id);

      // Start processing
  const processResponse = await fetch(`https://fastapi-app-63563783552.us-east1.run.app/api/documents/${document.id}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!processResponse.ok) {
        console.error("Failed to start processing");
        setIsProcessing(false);
        return;
      }

      await pollForCompletion(document.id);

    } catch (error) {
      console.error("Upload/processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Poll for processing completion
  const pollForCompletion = async (documentId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes with 2-second intervals

    const poll = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
  const response = await fetch(`https://fastapi-app-63563783552.us-east1.run.app/api/documents/${documentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const { document } = await response.json();
          
          // Update the document in the list
          setDocuments(prev => 
            prev.map(doc => doc.id === documentId ? document : doc)
          );

          if (document.status === "processed" || document.status === "failed") {
            setIsProcessing(false);
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setIsProcessing(false);
          console.error("Processing timed out");
        }
      } catch (error) {
        console.error("Polling error:", error);
        setIsProcessing(false);
      }
    };

    poll();
  };

  // Handle document selection
  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocumentId(documentId);
  };

  // Handle new chat
  const handleNewChat = () => {
    setSelectedDocumentId(null);
  };

  // Load documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const selectedDocument = documents.find(doc => doc.id === selectedDocumentId) || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin border-slate-300 border-t-blue-600" />
          <span className="text-sm text-slate-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveLayout
      sidebar={
        <Sidebar
          documents={documents}
          selectedDocumentId={selectedDocumentId}
          onDocumentSelect={handleDocumentSelect}
          onNewUpload={handleNewChat}
          user={user}
        />
      }
      mainContent={
        <ChatArea
          selectedDocument={selectedDocument}
          isProcessing={isProcessing}
          onFileUpload={handleFileUpload}
          onNewChat={handleNewChat}
        />
      }
    />
  );
}

