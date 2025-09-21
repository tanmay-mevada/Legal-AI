"use client";

import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";
import FileUploadArea from "./FileUploadArea";
import MobileHeader from "../layout/MobileHeader";

interface Document {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  extracted_text?: string;
  summary?: string;
  detailed_explanation?: string;
  processed_at?: string;
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

interface ChatAreaProps {
  selectedDocument: Document | null;
  isProcessing: boolean;
  onFileUpload: (file: File) => void;
  onNewChat: () => void;
}

export default function ChatArea({
  selectedDocument,
  isProcessing,
  onFileUpload,
  onNewChat,
}: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [selectedDocument, isProcessing]);

  const renderMessages = () => {
    if (!selectedDocument) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="mb-6 max-w-md">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Welcome to TautologyAI
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Upload a legal document to get an AI-powered summary and analysis. 
              Your documents will appear in the sidebar for easy access.
            </p>
          </div>
          <FileUploadArea onFileUpload={onFileUpload} />
        </div>
      );
    }

    const messages = [];

    // User message (file upload)
    messages.push(
      <MessageBubble
        key="user-upload"
        type="user"
        content=""
        fileName={selectedDocument.file_name}
        timestamp={selectedDocument.created_at}
      />
    );

    // Processing message
    if (isProcessing || selectedDocument.status === 'processing') {
      messages.push(
        <MessageBubble
          key="processing"
          type="assistant"
          content=""
          isProcessing={true}
        />
      );
    }

    // AI response (if processed) - Single consolidated response
    if (selectedDocument.status === 'processed') {
      messages.push(
        <MessageBubble
          key="ai-analysis"
          type="assistant"
          content=""
          timestamp={selectedDocument.processed_at}
          contentType="consolidated-analysis"
          documentMetadata={selectedDocument.document_metadata}
          extractedText={selectedDocument.extracted_text}
          detailedExplanation={selectedDocument.detailed_explanation}
          summary={selectedDocument.summary}
        />
      );
    }

    // Error message (if failed)
    if (selectedDocument.status === 'failed') {
      messages.push(
        <MessageBubble
          key="error"
          type="assistant"
          content=""
          errorCode={selectedDocument.error_code}
          errorMessage={selectedDocument.error_message || "Document processing failed. Please try uploading it again or contact support if the issue persists."}
          fileName={selectedDocument.file_name}
        />
      );
    }

    return messages;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <MobileHeader
  title={selectedDocument ? selectedDocument.file_name : "TautologyAI Chat"}
        subtitle={selectedDocument ? `Uploaded ${new Date(selectedDocument.created_at).toLocaleDateString()}` : undefined}
        onNewChat={onNewChat}
        showNewChatButton={true}
      />

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          {renderMessages()}
        </div>
      </ScrollArea>
    </div>
  );
}

