"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { API_URLS, buildApiUrl } from "@/lib/config";
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
  const response = await fetch(API_URLS.DOCUMENTS, {
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

  // Handle file upload using backend upload endpoint
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      
      // Check if document already exists first
      const existingResponse = await fetch(API_URLS.DOCUMENTS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (existingResponse.ok) {
        const data = await existingResponse.json();
        const found = data.documents?.find((d: Document) => d.file_name === file.name);
        if (found) {
          if (found.status === "processed") {
            setSelectedDocumentId(found.id);
            setIsProcessing(false);
            return;
          } else if (found.status === "uploaded") {
            // Start processing existing document
            const processResponse = await fetch(API_URLS.PROCESS_DOCUMENT(found.id), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            if (processResponse.ok) {
              await pollForCompletion(found.id);
              setSelectedDocumentId(found.id);
            }
            setIsProcessing(false);
            return;
          }
        }
      }

      // Use backend upload endpoint for reliable file upload
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch(buildApiUrl("/api/upload"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error("Document upload failed:", errorData.detail || "unknown error");
        
        // Show user-friendly error messages
        let userMessage = "Failed to upload document. Please try again.";
        if (uploadResponse.status === 409) {
          userMessage = errorData.detail || "This document already exists.";
        } else if (uploadResponse.status === 400) {
          userMessage = errorData.detail || "Invalid file format or size.";
        }
        
        // You can add a toast notification here if you have one
        alert(userMessage);
        
        setIsProcessing(false);
        return;
      }

      const { document } = await uploadResponse.json();
      
      // Update documents list - add new document
      setDocuments(prev => [document, ...prev]);
      
      // Immediately show the document to reduce perceived delay
      setSelectedDocumentId(document.id);

      // New document uploaded successfully - start processing
      console.log(`Starting processing for new document: ${document.file_name}`);
      
      // Start processing the uploaded document
      const processResponse = await fetch(API_URLS.PROCESS_DOCUMENT(document.id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (processResponse.ok) {
        await pollForCompletion(document.id);
      } else {
        console.error("Failed to start processing");
        alert("Failed to start processing. Please try again.");
      }

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
  const response = await fetch(API_URLS.GET_DOCUMENT(documentId), {
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
          user={user}
        />
      }
    />
  );
}

