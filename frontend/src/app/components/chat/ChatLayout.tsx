"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabaseClient";
import { getAuth } from "firebase/auth";
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
      const response = await fetch("http://127.0.0.1:8000/api/documents/", {
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
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Create document metadata
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("http://127.0.0.1:8000/api/documents/", {
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
        throw new Error(`Document creation failed: ${errorData.detail || "unknown error"}`);
      }

      const { document } = await response.json();
      
      // Add to documents list and select it
      setDocuments(prev => [document, ...prev]);
      setSelectedDocumentId(document.id);

      // Start processing
      const processResponse = await fetch(`http://127.0.0.1:8000/api/documents/${document.id}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!processResponse.ok) {
        throw new Error("Failed to start processing");
      }

      // Poll for completion
      await pollForCompletion(document.id);

    } catch (error) {
      console.error("Upload/processing error:", error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        const response = await fetch(`http://127.0.0.1:8000/api/documents/${documentId}`, {
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

