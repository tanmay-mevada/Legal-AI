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
        return 'text-green-600';
      case 'processing':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <FileText className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Legal AI
            </h1>
          </div>
          <Button
            onClick={onNewUpload}
            size="sm"
            className="h-8 w-8 rounded-full p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

      <Separator />

      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
            <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.displayName || user.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
          <Button
            onClick={() => signOut(auth)}
            size="sm"
            variant="ghost"
            className="h-8 w-8 rounded-full p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Documents List */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 pb-2">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Documents
          </h2>
        </div>
        <ScrollArea className="flex-1 px-4 pb-4">
          <div className="space-y-1">
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No documents yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Upload your first document to get started
                </p>
              </div>
            ) : (
              documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => onDocumentSelect(doc.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedDocumentId === doc.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <FileText className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {doc.file_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs ${getStatusColor(doc.status)}`}>
                          {doc.status === 'processed' ? 'Ready' : 
                           doc.status === 'processing' ? 'Processing' :
                           doc.status === 'failed' ? 'Failed' : 'Uploaded'}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
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

