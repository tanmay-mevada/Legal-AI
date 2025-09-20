"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Upload, User } from "lucide-react";
import FileUploadArea from "./FileUploadArea";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  file_name: string;
  status: string;
  extracted_text?: string;
  summary?: string;
  created_at: string;
}

interface ChatLayoutProps {
  user: any;
}

export default function ChatLayout({ user }: ChatLayoutProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

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
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: `Uploaded: ${file.name}`,
      timestamp: new Date(),
      fileName: file.name,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Upload file to Supabase
      const { supabase } = await import("@/lib/supabaseClient");
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `user-files/${safeName}`;
      
      const { error: uploadError } = await supabase.storage.from("uploads").upload(path, file);
      if (uploadError) throw uploadError;

      // Create document metadata
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("http://127.0.0.1:8000/api/documents/", {
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

      if (!res.ok) throw new Error("Failed to create document");
      const { document } = await res.json();

      // Start processing
      const processRes = await fetch(`http://127.0.0.1:8000/api/documents/${document.id}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!processRes.ok) throw new Error("Failed to start processing");

      // Poll for completion
      await pollForCompletion(document.id);
      
    } catch (error) {
      console.error("Upload error:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: "error",
        content: "Failed to process document. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsProcessing(false);
      fetchDocuments(); // Refresh document list
    }
  };

  // Poll for processing completion
  const pollForCompletion = async (docId: string) => {
    let tries = 0;
    const maxTries = 60;
    
    while (tries < maxTries) {
      try {
        const token = await auth.currentUser?.getIdToken();
        const resp = await fetch(`http://127.0.0.1:8000/api/documents/${docId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (resp.ok) {
          const { document } = await resp.json();
          if (document.status === "processed") {
            // Add AI response messages
            const aiMessages = [
              {
                id: Date.now() + 2,
                type: "ai",
                content: document.extracted_text || "",
                timestamp: new Date(),
                title: "Extracted Text",
              },
              {
                id: Date.now() + 3,
                type: "ai",
                content: document.summary || "",
                timestamp: new Date(),
                title: "AI Summary",
                isMarkdown: true,
              },
            ];
            setMessages(prev => [...prev, ...aiMessages]);
            setSelectedDocument(document);
            return;
          } else if (document.status === "failed") {
            setMessages(prev => [...prev, {
              id: Date.now() + 2,
              type: "error",
              content: "Document processing failed. Please try again.",
              timestamp: new Date(),
            }]);
            return;
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
      
      await new Promise(r => setTimeout(r, 2000));
      tries++;
    }
    
    // Timeout
    setMessages(prev => [...prev, {
      id: Date.now() + 2,
      type: "error",
      content: "Processing timed out. Please try again.",
      timestamp: new Date(),
    }]);
  };

  // Handle document selection from sidebar
  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setMessages([
      {
        id: 1,
        type: "user",
        content: `Uploaded: ${document.file_name}`,
        timestamp: new Date(document.created_at),
        fileName: document.file_name,
      },
      ...(document.extracted_text ? [{
        id: 2,
        type: "ai",
        content: document.extracted_text,
        timestamp: new Date(document.created_at),
        title: "Extracted Text",
      }] : []),
      ...(document.summary ? [{
        id: 3,
        type: "ai",
        content: document.summary,
        timestamp: new Date(document.created_at),
        title: "AI Summary",
        isMarkdown: true,
      }] : []),
    ]);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Legal AI Assistant
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload documents for AI analysis
          </p>
        </div>
        
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-4 space-y-2">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className={cn(
                  "p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700",
                  selectedDocument?.id === doc.id && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                )}
                onClick={() => handleDocumentSelect(doc)}
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {doc.file_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        doc.status === "processed" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : doc.status === "failed"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      )}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {user.displayName || user.email}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Legal AI Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 && !isProcessing && (
              <div className="text-center py-12">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Upload a document to get started
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Drag and drop a PDF or click to browse files
                </p>
              </div>
            )}
            
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isProcessing && <TypingIndicator />}
          </div>
        </ScrollArea>

        {/* Upload Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <FileUploadArea onFileUpload={handleFileUpload} disabled={isProcessing} />
        </div>
      </div>
    </div>
  );
}

