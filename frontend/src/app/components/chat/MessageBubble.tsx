"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { FileText, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import ExpandableContent from "./ExpandableContent";
import RiskWarningBar from "./RiskWarningBar";
import DocumentMetadata from "./DocumentMetadata";
import ErrorDisplay from "./ErrorDisplay";

interface MessageBubbleProps {
  type: "user" | "assistant";
  content: string;
  fileName?: string;
  timestamp?: string;
  isProcessing?: boolean;
  contentType?: "extracted-text" | "summary" | "general";
  documentMetadata?: {
    documentType?: string;
    complexity?: string;
    riskLevel?: "Low" | "Medium" | "High";
    riskFactors?: string[];
    wordCount?: number;
    pageCount?: number;
    keyParties?: string[];
  };
  errorCode?: string;
  errorMessage?: string;
}

export default function MessageBubble({
  type,
  content,
  fileName,
  timestamp,
  isProcessing = false,
  contentType = "general",
  documentMetadata,
  errorCode,
  errorMessage,
}: MessageBubbleProps) {
  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (type === "user") {
    return (
      <div className="flex justify-end mb-4 px-2 sm:px-0">
        <div className="flex items-start gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%]">
          <div className="flex flex-col items-end gap-2">
            <div className="bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-br-md shadow-sm">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">Uploaded file</span>
              </div>
              <p className="text-xs sm:text-sm opacity-90 break-words">{fileName}</p>
            </div>
            {timestamp && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(timestamp)}
              </span>
            )}
          </div>
          <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-blue-600 text-white flex-shrink-0">
            <User className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4 px-2 sm:px-0">
      <div className="flex items-start gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%]">
        <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex-shrink-0">
          <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-md shadow-sm">
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Processing your document...
                </span>
              </div>
            ) : (
              <div>
                {/* Error Display - show if there's an error */}
                {errorCode && errorMessage && (
                  <ErrorDisplay
                    errorCode={errorCode}
                    errorMessage={errorMessage}
                    fileName={fileName}
                  />
                )}
                
                {/* Risk Warning Bar - only show if risk level exists and no error */}
                {!errorCode && documentMetadata?.riskLevel && (
                  <RiskWarningBar 
                    riskLevel={documentMetadata.riskLevel}
                    riskFactors={documentMetadata.riskFactors}
                  />
                )}
                
                {/* Document Metadata - only show for summary content type and no error */}
                {!errorCode && contentType === "summary" && documentMetadata && (
                  <DocumentMetadata
                    documentType={documentMetadata.documentType}
                    complexity={documentMetadata.complexity}
                    wordCount={documentMetadata.wordCount}
                    pageCount={documentMetadata.pageCount}
                    keyParties={documentMetadata.keyParties}
                  />
                )}
                
                {/* Content - only show if no error */}
                {!errorCode && (
                  <>
                    {contentType === "extracted-text" ? (
                      <ExpandableContent
                        title="Extracted Text"
                        content={content}
                        defaultExpanded={false}
                        maxPreviewLength={300}
                      />
                    ) : contentType === "summary" ? (
                      <ExpandableContent
                        title="AI Summary"
                        content={content}
                        defaultExpanded={true}
                        maxPreviewLength={200}
                      />
                    ) : (
                      <div className="prose prose-xs sm:prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown>{content}</ReactMarkdown>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          {timestamp && !isProcessing && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(timestamp)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

