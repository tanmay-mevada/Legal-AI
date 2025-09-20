"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpandableContentProps {
  title: string;
  content: string;
  defaultExpanded?: boolean;
  maxPreviewLength?: number;
}

export default function ExpandableContent({
  title,
  content,
  defaultExpanded = false,
  maxPreviewLength = 200
}: ExpandableContentProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const shouldTruncate = content.length > maxPreviewLength;
  const displayContent = isExpanded || !shouldTruncate 
    ? content 
    : content.substring(0, maxPreviewLength) + "...";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {shouldTruncate && (
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Expand
              </>
            )}
          </Button>
        )}
      </div>
      
      <div className="prose prose-xs sm:prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{displayContent}</ReactMarkdown>
      </div>
      
      {shouldTruncate && !isExpanded && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {content.length - maxPreviewLength} more characters...
        </div>
      )}
    </div>
  );
}
