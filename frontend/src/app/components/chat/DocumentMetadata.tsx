"use client";

import React from "react";
import { FileText, Calendar, Users, Clock, Tag, ScrollText, Signature, Scale, WholeWord } from "lucide-react";

interface DocumentMetadataProps {
  documentType?: string;
  complexity?: string;
  wordCount?: number;
  pageCount?: number;
  processingTime?: string;
  keyParties?: string[];
}

export default function DocumentMetadata({
  documentType,
  complexity,
  wordCount,
  pageCount,
  processingTime,
  keyParties
}: DocumentMetadataProps) {
  const getComplexityColor = (complexity?: string) => {
    switch (complexity?.toLowerCase()) {
      case "simple":
        return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
      case "moderate":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "complex":
        return "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getDocumentTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "contract":
      case "agreement":
        return <Signature className="w-3 h-3 text-gray-500" />;
      case "policy":
        return <Tag className="w-3 h-3 text-gray-500" />;
      case "legal brief":
        return <Scale className="w-3 h-3 text-gray-500" />;
      case "memo":
        return <Calendar className="w-3 h-3 text-gray-500" />;
      case "court document":
        return <Users className="w-3 h-3 text-gray-500" />;
      default:
        return <ScrollText className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <div className="p-4 mb-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          Document Analysis
        </h4>
      </div>
      
      <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
        
        {documentType && (
          
          <div className="flex items-center w-3 h-3 gap-2 text-gray-500">
            <span className="w-3 h-3 gap-2 text-gray-500">{getDocumentTypeIcon(documentType)}</span>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
              <span className="ml-1 text-gray-600 dark:text-gray-400">{documentType}</span>
            </div>
          </div>
        )}
        
        {complexity && (
          <div className="flex items-center gap-2">
            <Tag className="w-3 h-3 text-gray-500" />
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Complexity:</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${getComplexityColor(complexity)}`}>
                {complexity}
              </span>
            </div>
          </div>
        )}
        
        {wordCount && (
          <div className="flex items-center gap-2">
            <WholeWord className="w-3 h-3 text-gray-500" />
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Words:</span>
              <span className="ml-1 text-gray-600 dark:text-gray-400">{wordCount.toLocaleString()}</span>
            </div>
          </div>
        )}
        
        {pageCount && (
          <div className="flex items-center gap-2">
            <FileText className="w-3 h-3 text-gray-500" />
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Pages:</span>
              <span className="ml-1 text-gray-600 dark:text-gray-400">{pageCount}</span>
            </div>
          </div>
        )}
        
        {processingTime && (
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-gray-500" />
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Processed:</span>
              <span className="ml-1 text-gray-600 dark:text-gray-400">{processingTime}</span>
            </div>
          </div>
        )}
      </div>
      
      {keyParties && keyParties.length > 0 && (
        <div className="pt-3 mt-3 border-t border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-3 h-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Key Parties:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {keyParties.slice(0, 3).map((party, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full dark:bg-blue-800 dark:text-blue-200"
              >
                {party}
              </span>
            ))}
            {keyParties.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-400">
                +{keyParties.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
