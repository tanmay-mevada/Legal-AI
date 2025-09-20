"use client";

import React from "react";
import { AlertTriangle, FileX, Clock, Shield } from "lucide-react";

interface ErrorDisplayProps {
  errorCode?: string;
  errorMessage: string;
  fileName?: string;
}

export default function ErrorDisplay({ errorCode, errorMessage, fileName }: ErrorDisplayProps) {
  const getErrorConfig = (code?: string) => {
    switch (code) {
      case "PAGE_LIMIT_EXCEEDED":
        return {
          icon: FileX,
          bgColor: "bg-orange-50 dark:bg-orange-900/20",
          borderColor: "border-orange-200 dark:border-orange-800",
          textColor: "text-orange-800 dark:text-orange-200",
          iconColor: "text-orange-600 dark:text-orange-400",
          title: "Document Too Large",
          suggestion: "Please split your document into smaller parts (max 30 pages per file)."
        };
      case "FILE_SIZE_EXCEEDED":
        return {
          icon: FileX,
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          textColor: "text-red-800 dark:text-red-200",
          iconColor: "text-red-600 dark:text-red-400",
          title: "File Too Large",
          suggestion: "Please use a file smaller than 20MB."
        };
      case "INVALID_DOCUMENT":
        return {
          icon: AlertTriangle,
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          textColor: "text-yellow-800 dark:text-yellow-200",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          title: "Unsupported Format",
          suggestion: "Please upload PDF, DOC, or DOCX files only."
        };
      case "CORRUPTED_DOCUMENT":
        return {
          icon: AlertTriangle,
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          textColor: "text-red-800 dark:text-red-200",
          iconColor: "text-red-600 dark:text-red-400",
          title: "Corrupted File",
          suggestion: "The file appears to be corrupted. Please try uploading a different file."
        };
      case "QUOTA_EXCEEDED":
        return {
          icon: Clock,
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          textColor: "text-blue-800 dark:text-blue-200",
          iconColor: "text-blue-600 dark:text-blue-400",
          title: "Processing Limit Reached",
          suggestion: "Please try again later or contact support if the issue persists."
        };
      case "PERMISSION_DENIED":
        return {
          icon: Shield,
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          textColor: "text-red-800 dark:text-red-200",
          iconColor: "text-red-600 dark:text-red-400",
          title: "Authentication Error",
          suggestion: "Please contact support for assistance."
        };
      default:
        return {
          icon: AlertTriangle,
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          borderColor: "border-gray-200 dark:border-gray-800",
          textColor: "text-gray-800 dark:text-gray-200",
          iconColor: "text-gray-600 dark:text-gray-400",
          title: "Processing Error",
          suggestion: "Please try again or contact support if the issue persists."
        };
    }
  };

  const config = getErrorConfig(errorCode);
  const IconComponent = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <IconComponent className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-semibold ${config.textColor}`}>
              {config.title}
            </span>
          </div>
          
          {fileName && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              File: <span className="font-medium">{fileName}</span>
            </p>
          )}
          
          <p className={`text-sm ${config.textColor} mb-2`}>
            {errorMessage}
          </p>
          
          <p className="text-xs text-gray-600 dark:text-gray-400">
            💡 <span className="font-medium">Suggestion:</span> {config.suggestion}
          </p>
        </div>
      </div>
    </div>
  );
}
