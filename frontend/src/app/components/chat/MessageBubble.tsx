"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { FileText, Bot, User, AlertTriangle, Info, XCircle, CheckCircle, Clock } from "lucide-react";
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
  contentType?: "extracted-text" | "summary" | "general" | "consolidated-analysis";
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
  extractedText?: string;
  detailedExplanation?: string;
  summary?: string;
}

// Helper function to parse and format detailed explanation
const formatDetailedExplanation = (content: string) => {
  // Split content by section markers (***) and (**) 
  const sections = content.split(/\*\*\*/).filter(Boolean);
  
  return sections.map((section, index) => {
    const trimmedSection = section.trim();
    if (!trimmedSection) return null;

    const titleMatch = trimmedSection.match(/^([^*]+?)\*\*\s*([\s\S]*)$/);
    
    if (titleMatch) {
      const [, title, content] = titleMatch;
      const cleanTitle = title.replace(/^\*+/, '').trim();
      const cleanContent = content.trim();
      
      // Determine icon based on section title
      let icon;
      let bgColor;
      let borderColor;
      let textColor;
      
      if (cleanTitle.toLowerCase().includes('executive summary')) {
        icon = <Info className="w-4 h-4" />;
        bgColor = 'bg-blue-50 dark:bg-blue-900/20';
        borderColor = 'border-blue-200 dark:border-blue-700';
        textColor = 'text-blue-800 dark:text-blue-200';
      } else if (cleanTitle.toLowerCase().includes('risk') || cleanTitle.toLowerCase().includes('red flag')) {
        icon = <AlertTriangle className="w-4 h-4" />;
        bgColor = 'bg-red-50 dark:bg-red-900/20';
        borderColor = 'border-red-200 dark:border-red-700';
        textColor = 'text-red-800 dark:text-red-200';
      } else if (cleanTitle.toLowerCase().includes('obligation') || cleanTitle.toLowerCase().includes('responsibilit')) {
        icon = <CheckCircle className="w-4 h-4" />;
        bgColor = 'bg-green-50 dark:bg-green-900/20';
        borderColor = 'border-green-200 dark:border-green-700';
        textColor = 'text-green-800 dark:text-green-200';
      } else if (cleanTitle.toLowerCase().includes('termination') || cleanTitle.toLowerCase().includes('penalty')) {
        icon = <XCircle className="w-4 h-4" />;
        bgColor = 'bg-orange-50 dark:bg-orange-900/20';
        borderColor = 'border-orange-200 dark:border-orange-700';
        textColor = 'text-orange-800 dark:text-orange-200';
      } else if (cleanTitle.toLowerCase().includes('terms') || cleanTitle.toLowerCase().includes('condition')) {
        icon = <FileText className="w-4 h-4" />;
        bgColor = 'bg-purple-50 dark:bg-purple-900/20';
        borderColor = 'border-purple-200 dark:border-purple-700';
        textColor = 'text-purple-800 dark:text-purple-200';
      } else {
        icon = <Clock className="w-4 h-4" />;
        bgColor = 'bg-gray-50 dark:bg-gray-800/50';
        borderColor = 'border-gray-200 dark:border-gray-600';
        textColor = 'text-gray-800 dark:text-gray-200';
      }
      
      return (
        <div key={index} className={cn("rounded-lg border p-4 mb-3", bgColor, borderColor)}>
          <div className={cn("flex items-center gap-2 mb-2", textColor)}>
            {icon}
            <h4 className="text-sm font-semibold">{cleanTitle}</h4>
          </div>
          <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {cleanContent}
          </div>
        </div>
      );
    }
    
    // If no title pattern found, treat as regular content
    return (
      <div key={index} className="p-4 mb-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-600">
        <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {trimmedSection}
        </div>
      </div>
    );
  }).filter(Boolean);
};

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
  extractedText,
  detailedExplanation,
  summary,
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
      <div className="flex justify-end px-2 mb-4 sm:px-0">
        <div className="flex items-start gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%]">
          <div className="flex flex-col items-end gap-2">
            <div className="px-3 py-2 text-white bg-blue-600 shadow-sm sm:px-4 sm:py-3 rounded-2xl rounded-br-md">
              <div className="flex items-center gap-1 mb-1 sm:gap-2">
                <FileText className="w-3 h-3 sm:h-4 sm:w-4" />
                <span className="text-xs font-medium sm:text-sm">Uploaded file</span>
              </div>
              <p className="text-xs break-words sm:text-sm opacity-90">{fileName}</p>
            </div>
            {timestamp && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(timestamp)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-white bg-blue-600 rounded-full sm:h-8 sm:w-8">
            <User className="w-3 h-3 sm:h-4 sm:w-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start px-2 mb-4 sm:px-0">
      <div className="flex items-start gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%]">
        <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-gray-600 bg-gray-100 rounded-full sm:h-8 sm:w-8 dark:bg-gray-800 dark:text-gray-300">
          <Bot className="w-3 h-3 sm:h-4 sm:w-4" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="px-3 py-2 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 sm:px-4 sm:py-3 rounded-2xl rounded-bl-md">
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
                <span className="text-xs text-gray-600 sm:text-sm dark:text-gray-300">
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
                
                {/* Content - only show if no error */}
                {!errorCode && (
                  <>
                    {contentType === "consolidated-analysis" ? (
                      <div className="space-y-4">
                        {/* Risk Warning Bar and Document Metadata */}
                        {documentMetadata?.riskLevel && (
                          <RiskWarningBar 
                            riskLevel={documentMetadata.riskLevel}
                            riskFactors={documentMetadata.riskFactors}
                          />
                        )}
                        {documentMetadata && (
                          <DocumentMetadata
                            documentType={documentMetadata.documentType}
                            complexity={documentMetadata.complexity}
                            wordCount={documentMetadata.wordCount}
                            pageCount={documentMetadata.pageCount}
                            keyParties={documentMetadata.keyParties}
                          />
                        )}

                        {/* Extracted Text */}
                        {extractedText && (
                          <ExpandableContent
                            title="Extracted Text"
                            content={extractedText}
                            defaultExpanded={false}
                            maxPreviewLength={50}
                          />
                        )}

                        {/* Enhanced Detailed Analysis */}
                        {detailedExplanation && 
                          <div className="px-4 py-3 space-y-2 border-l-4 border-blue-500 rounded-md shadow-sm bg-blue-50 dark:bg-gray-900/40">
                            <h3 className="mb-2 text-base font-bold text-blue-700 dark:text-blue-300">Detailed Analysis</h3>
                            <div className="prose-sm prose max-w-none dark:prose-invert">
                              <ReactMarkdown>{detailedExplanation}</ReactMarkdown>
                            </div>
                          </div>
                        }

                        {/* Summary */}
                        {summary && (
                          <div className="px-4 py-3 space-y-2 border-r-4 border-blue-500 rounded-md shadow-sm bg-blue-50 dark:bg-gray-900/30">
                            <h3 className="mb-2 text-base font-bold text-blue-700 dark:text-blue-300">Executive Summary</h3>
                            <div className="prose-sm prose max-w-none dark:prose-invert">
                              <ReactMarkdown>{summary}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : contentType === "extracted-text" ? (
                      <ExpandableContent
                        title="Extracted Text"
                        content={content}
                        defaultExpanded={false}
                        maxPreviewLength={50}
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