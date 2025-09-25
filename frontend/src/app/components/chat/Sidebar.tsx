"use client";

import React from "react";
import { FileText, Plus, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface Document {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  summary?: string;
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

interface SidebarProps {
  documents: Document[];
  selectedDocumentId: string | null;
  onDocumentSelect: (documentId: string) => void;
  onNewUpload: () => void;
  user: {
    displayName?: string | null;
    email?: string | null;
  };
}

export default function Sidebar({
  documents,
  selectedDocumentId,
  onDocumentSelect,
  onNewUpload,
  user,
}: SidebarProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 text-black rounded-lg shadow-sm">
            <FileText className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            TautologyAI
          </h1>
        </div>
        <Button
          onClick={onNewUpload}
          size="sm"
          className="w-8 h-8 p-0 text-white bg-black rounded-full shadow-sm hover:bg-white hover:text-black"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Separator />

      {/* User Info */}
      <div className="p-3 sm:p-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
            <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
              {user.displayName || user.email}
            </p>
            {user.displayName && user.email && (
              <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                {user.email}
              </p>
            )}
          </div>
          <Button
            onClick={() => signOut(auth)}
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0 text-gray-500 transition-colors rounded-full hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Documents List */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="p-3 pb-2 sm:p-4 shrink-0">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">
            Recent Documents
          </h2>
        </div>
        <ScrollArea className="flex-1 px-3 pb-4 sm:px-4">
          <div className="space-y-1">
            {documents.length === 0 ? (
              <div className="py-6 text-center sm:py-8">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full dark:bg-gray-800">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                  No documents yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Upload your first document to get started
                </p>
              </div>
            ) : (
              documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => onDocumentSelect(doc.id)}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-lg transition-all duration-200 ${
                    selectedDocumentId === doc.id
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 shadow-sm'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`p-1 rounded ${
                        selectedDocumentId === doc.id 
                          ? 'bg-blue-100 dark:bg-blue-900/30' 
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <FileText className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          selectedDocumentId === doc.id
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500'
                        }`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="mb-1 text-xs font-medium text-gray-900 truncate sm:text-sm dark:text-white">
                        {doc.file_name}
                      </p>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getStatusColor(doc.status)}`}>
                          {doc.status === 'processed' ? 'Ready' : 
                           doc.status === 'processing' ? 'Processing' :
                           doc.status === 'failed' ? 'Failed' : 'Uploaded'}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(doc.created_at)}
                        </span>
                      </div>
                      
                      {/* Document Type and Risk Level */}
                      {doc.document_metadata && (
                        <div className="flex items-center gap-1 mt-1">
                          {doc.document_metadata.documentType && (
                            <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs">
                              {doc.document_metadata.documentType}
                            </span>
                          )}
                          {doc.document_metadata.riskLevel && (
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              doc.document_metadata.riskLevel === 'High' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                              doc.document_metadata.riskLevel === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
                              'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                            }`}>
                              {doc.document_metadata.riskLevel} Risk
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

