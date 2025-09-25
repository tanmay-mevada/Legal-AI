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
        <div className="flex flex-col items-center justify-center h-full px-4 text-center">
          <div className="max-w-2xl mb-8">
            {/* Title */}
            <h1 className="mb-3 text-xl font-bold text-gray-900 sm:mb-4 sm:text-2xl lg:text-3xl xl:text-4xl dark:text-white">
              Welcome to <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">TautologyAI</span>
            </h1>
            
            {/* Description */}
            <p className="mb-4 text-sm leading-relaxed text-gray-600 sm:text-base lg:text-lg xl:text-xl dark:text-gray-400 sm:mb-6">
              Transform your legal documents with AI-powered analysis. Get instant summaries, 
              risk assessments, and detailed insights from contracts, agreements, and legal texts.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-3 sm:gap-4 sm:mb-8">
              <div className="flex flex-col items-center p-3 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-4 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md">
                <div className="flex items-center justify-center w-8 h-8 mb-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="mb-1 text-sm font-medium text-gray-900 dark:text-white">Instant Analysis</span>
                <span className="text-xs text-center text-gray-600 sm:text-sm dark:text-gray-400">AI-powered document processing in seconds</span>
              </div>
              
              <div className="flex flex-col items-center p-3 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-4 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md">
                <div className="flex items-center justify-center w-8 h-8 mb-2 bg-red-100 rounded-lg dark:bg-red-900/20">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <span className="mb-1 text-sm font-medium text-gray-900 dark:text-white">Risk Detection</span>
                <span className="text-xs text-center text-gray-600 sm:text-sm dark:text-gray-400">Identify potential legal risks and red flags</span>
              </div>
              
              <div className="flex flex-col items-center p-3 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm sm:p-4 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md">
                <div className="flex items-center justify-center w-8 h-8 mb-2 bg-green-100 rounded-lg dark:bg-green-900/20">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="mb-1 text-sm font-medium text-gray-900 dark:text-white">Smart Summaries</span>
                <span className="text-xs text-center text-gray-600 sm:text-sm dark:text-gray-400">Clear, actionable document summaries</span>
              </div>
            </div>
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
  title={selectedDocument ? selectedDocument.file_name : "New Chat"}
        subtitle={selectedDocument ? `Uploaded ${new Date(selectedDocument.created_at).toLocaleDateString()}` : undefined}
        onNewChat={onNewChat}
        showNewChatButton={true}
      />

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-2 sm:p-4 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-4">
          {renderMessages()}
        </div>
      </ScrollArea>
    </div>
  );
}

