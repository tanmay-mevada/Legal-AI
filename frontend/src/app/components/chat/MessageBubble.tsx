"use client";

import React, { useState, useEffect, useRef } from "react";
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

// Typing animation component
const TypewriterText: React.FC<{ text: string; speed?: number; delay?: number }> = ({ 
  text, 
  speed = 5, 
  delay = 0 
}) => {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    const timer = setTimeout(() => {
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          setIsComplete(true);
          clearInterval(typeInterval);
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, speed, delay]);

  return (
    <span>
      {displayText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
};

// Animated section component
const AnimatedSection: React.FC<{ 
  children: React.ReactNode; 
  delay?: number; 
  className?: string;
}> = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        "transform transition-all duration-700 ease-out",
        isVisible 
          ? "translate-y-0 opacity-100" 
          : "translate-y-4 opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
};

// Helper function to parse and format detailed explanation
const formatDetailedExplanation = (content: string) => {
  // First try to split by *** markers, if that doesn't work, try ** markers
  let sections = content.split(/\*\*\*/).filter(Boolean);
  
  if (sections.length <= 1) {
    // If no *** markers found, try splitting by ** at the start of lines
    sections = content.split(/\n\s*\*\*(?!\*)/).filter(Boolean);
  }
  
  return sections.map((section, index) => {
    const trimmedSection = section.trim();
    if (!trimmedSection) return null;

      // Remove leading '**' from section titles and avoid duplicate titles
        const cleanedSection = trimmedSection.replace(/^\*+\s*/, '');
        let titleMatch = cleanedSection.match(/^\s*([^*\n]+?)\*\*\s*([\s\S]*)$/);

      if (!titleMatch) {
        // Try alternative pattern for titles
        titleMatch = trimmedSection.match(/^\*{0,2}\s*([^:\n]+):\s*([\s\S]*)$/);
      }

      if (titleMatch) {
        const [, title, content] = titleMatch;
          const cleanTitle = title.replace(/^\*+/, '').trim();
          const cleanContent = content.replace(/^\*+/, '').trim();
      
      // Determine icon and styling based on section title
      let icon;
      let sectionClasses;
      
      if (cleanTitle.toLowerCase().includes('executive summary')) {
        sectionClasses = 'bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-600';
      } else if (cleanTitle.toLowerCase().includes('risk') || cleanTitle.toLowerCase().includes('red flag')) {
        icon = <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />;
        sectionClasses = 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-600';
      } else if (cleanTitle.toLowerCase().includes('obligation') || cleanTitle.toLowerCase().includes('responsibilit')) {
        icon = <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
        sectionClasses = 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-600';
      } else if (cleanTitle.toLowerCase().includes('termination') || cleanTitle.toLowerCase().includes('penalty')) {
        icon = <XCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
        sectionClasses = 'bg-orange-50 border-orange-200 dark:bg-orange-900 dark:border-orange-600';
      } else if (cleanTitle.toLowerCase().includes('terms') || cleanTitle.toLowerCase().includes('condition')) {
        icon = <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
        sectionClasses = 'bg-purple-50 border-purple-200 dark:bg-purple-900 dark:border-purple-600';
      } else {
        icon = <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
        sectionClasses = 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600';
      }
      
      return (
        <AnimatedSection key={index} delay={index * 200} className={cn("rounded-lg border p-4 mb-3", sectionClasses)}>
          <div className="flex items-center gap-2 mb-2">
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{cleanTitle}</h4>
          </div>
          <div className="prose prose-sm text-gray-700 max-w-none dark:prose-invert dark:text-gray-300 leading-relaxed">
            <TypewriterText text={cleanContent.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*/g, '')} speed={3} delay={index * 50} />
          </div>
        </AnimatedSection>
      );
    }
    
    // If no title pattern found, treat as regular content with better contrast
    return (
      <AnimatedSection key={index} delay={index * 200} className="p-4 mb-3 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-600">
        <div className="prose prose-sm text-gray-700 max-w-none dark:prose-invert dark:text-gray-300 leading-relaxed">
          <TypewriterText text={cleanedSection.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*/g, '')} speed={3} delay={index * 50} />
        </div>
      </AnimatedSection>
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
      <AnimatedSection className="flex justify-end px-2 mb-6 sm:px-0">
        <div className="flex items-start gap-2 sm:gap-3 max-w-[85%] sm:max-w-[70%]">
          <div className="flex flex-col items-end gap-2">
            <div className="px-4 py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg sm:px-5 sm:py-4 rounded-2xl rounded-br-md">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 sm:h-5 sm:w-5" />
                <span className="text-sm font-medium sm:text-base">Uploaded Document</span>
              </div>
              <p className="text-sm break-words sm:text-base opacity-95">{fileName}</p>
            </div>
            {timestamp && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(timestamp)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-white bg-blue-600 rounded-full sm:h-10 sm:w-10">
            <User className="w-4 h-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </AnimatedSection>
    );
  }

  return (
    <AnimatedSection className="flex justify-start px-2 mb-6 sm:px-0">
      <div className="flex items-start gap-3 sm:gap-4 max-w-[95%] sm:max-w-[85%]">
        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-gray-600 bg-gray-100 rounded-full sm:h-10 sm:w-10 dark:bg-gray-800 dark:text-gray-300">
          <Bot className="w-4 h-4 sm:h-5 sm:w-5" />
        </div>
        <div className="flex flex-col gap-3 min-w-0 flex-1">
          <div className="px-4 py-4 bg-white border border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700 sm:px-6 sm:py-5 rounded-2xl rounded-bl-md">
            {isProcessing ? (
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
                <span className="text-sm text-gray-600 sm:text-base dark:text-gray-300">
                  Analyzing your document with AI...
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {errorCode && errorMessage && (
                  <ErrorDisplay
                    errorCode={errorCode}
                    errorMessage={errorMessage}
                    fileName={fileName}
                  />
                )}
                
                {!errorCode && (
                  <>
                    {contentType === "consolidated-analysis" ? (
                      <div className="space-y-5">
                        {/* Risk Warning Bar and Document Metadata */}
                        {documentMetadata?.riskLevel && (
                          <AnimatedSection delay={100}>
                            <RiskWarningBar 
                              riskLevel={documentMetadata.riskLevel}
                              riskFactors={documentMetadata.riskFactors}
                            />
                          </AnimatedSection>
                        )}
                        {documentMetadata && (
                          <AnimatedSection delay={200}>
                            <DocumentMetadata
                              documentType={documentMetadata.documentType}
                              complexity={documentMetadata.complexity}
                              wordCount={documentMetadata.wordCount}
                              pageCount={documentMetadata.pageCount}
                              keyParties={documentMetadata.keyParties}
                            />
                          </AnimatedSection>
                        )}

                        {/* Enhanced Detailed Analysis */}
                        {detailedExplanation && (
                          <AnimatedSection delay={300}>
                            <div className="px-5 py-4 space-y-2 border-l-4 border-blue-500 rounded-lg shadow-sm bg-blue-50 dark:bg-slate-800 dark:border-blue-400">
                              <div className="flex items-center gap-2 mb-4">
                                <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                  <TypewriterText text="Detailed Analysis" speed={8} />
                                </h3>
                              </div>
                              <div className="space-y-4">
                                {formatDetailedExplanation(detailedExplanation)}
                              </div>
                            </div>
                          </AnimatedSection>
                        )}

                        {/* Summary */}
                        {summary && (
                          <AnimatedSection delay={400}>
                            <div className="px-5 py-4 space-y-3 border-l-4 border-green-500 rounded-lg shadow-sm bg-green-50 dark:bg-slate-800 dark:border-green-400">
                              <h3 className="text-lg font-bold text-green-700 dark:text-green-300">
                                <TypewriterText text="Executive Summary" speed={8} />
                              </h3>
                              <div className="prose prose-sm text-gray-800 max-w-none dark:prose-invert dark:text-gray-200 leading-relaxed">
                                <TypewriterText text={summary.replace(/^\*+/, '').replace(/\*\*(.*?)\*\*/g, '$1')} speed={3} delay={100} />
                              </div>
                            </div>
                          </AnimatedSection>
                        )}

                        {/* Extracted Text */}
                        {extractedText && (
                          <AnimatedSection delay={500}>
                            <ExpandableContent
                              title="Full Document Text"
                              content={extractedText}
                              defaultExpanded={false}
                              maxPreviewLength={150}
                            />
                          </AnimatedSection>
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
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <TypewriterText text={content} speed={25} />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          {timestamp && !isProcessing && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {formatTime(timestamp)}
            </span>
          )}
        </div>
      </div>
    </AnimatedSection>
  );
}