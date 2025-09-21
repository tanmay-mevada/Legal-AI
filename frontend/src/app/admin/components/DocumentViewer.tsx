"use client";
import { useState } from "react";
import type { Document, UserWithDocuments } from "./AdminDashboard";

// type UserWithDocuments imported above

interface DocumentViewerProps {
  user: UserWithDocuments;
  onClose: () => void;
  formatFileSize: (bytes: number) => string;
}

export default function DocumentViewer({ user, onClose, formatFileSize }: DocumentViewerProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed":
        return "text-safe-400 bg-safe-900/20 border-safe-500/30";
      case "processing":
        return "text-primary-400 bg-primary-900/20 border-primary-500/30";
      case "failed":
        return "text-risk-400 bg-risk-900/20 border-risk-500/30";
      case "uploaded":
        return "text-electric-400 bg-electric-900/20 border-electric-500/30";
      default:
        return "text-dark-400 bg-dark-800/20 border-dark-500/30";
    }
  };

  const filteredDocuments = user.documents.filter((doc: Document) => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getContentTypeIcon = (contentType: string) => {
  if (contentType.includes("pdf")) return "";
  if (contentType.includes("word") || contentType.includes("document")) return "";
  if (contentType.includes("image")) return "";
  return "";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 rounded-xl border border-dark-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{user.displayName}</h2>
              <p className="text-dark-400">{user.email}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-dark-700 hover:bg-dark-600 rounded-lg flex items-center justify-center text-dark-300 hover:text-white transition-colors"
            >
              
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="p-6 border-b border-dark-700">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-400">{user.totalDocuments}</p>
              <p className="text-dark-400 text-sm">Total Documents</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-electric-400">{formatFileSize(user.totalSize)}</p>
              <p className="text-dark-400 text-sm">Total Size</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-neural-400">{user.loginCount}</p>
              <p className="text-dark-400 text-sm">Total Logins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-safe-400">
                {user.documents.filter((d: Document) => d.status === "processed").length}
              </p>
              <p className="text-dark-400 text-sm">Processed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-400">
                {user.documents.filter((d: Document) => d.status === "processing").length}
              </p>
              <p className="text-dark-400 text-sm">Processing</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-dark-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="uploaded">Uploaded</option>
              <option value="processing">Processing</option>
              <option value="processed">Processed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Documents List */}
        <div className="p-6 overflow-y-auto max-h-96">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-dark-400">No documents found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc: Document) => (
                <div
                  key={doc.id}
                  className={`p-4 rounded-lg border ${getStatusColor(doc.status)} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => setSelectedDocument(doc)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getContentTypeIcon(doc.content_type)}</span>
                      <div>
                        <h4 className="font-medium text-white">{doc.file_name}</h4>
                        <p className="text-sm opacity-75">
                          {formatFileSize(doc.size_bytes)} • {doc.pages} pages • {doc.content_type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-75">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document Details Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
            <div className="bg-dark-800 rounded-xl border border-dark-700 w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-dark-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Document Details</h3>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="w-8 h-8 bg-dark-700 hover:bg-dark-600 rounded-lg flex items-center justify-center text-dark-300 hover:text-white transition-colors"
                  >
                    
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-dark-400 text-sm">File Name</label>
                  <p className="text-white font-medium">{selectedDocument.file_name}</p>
                </div>
                <div>
                  <label className="text-dark-400 text-sm">Status</label>
                  <p className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDocument.status)}`}>
                    {selectedDocument.status}
                  </p>
                </div>
                <div>
                  <label className="text-dark-400 text-sm">Size</label>
                  <p className="text-white">{formatFileSize(selectedDocument.size_bytes)}</p>
                </div>
                <div>
                  <label className="text-dark-400 text-sm">Pages</label>
                  <p className="text-white">{selectedDocument.pages || "N/A"}</p>
                </div>
                <div>
                  <label className="text-dark-400 text-sm">Content Type</label>
                  <p className="text-white">{selectedDocument.content_type}</p>
                </div>
                <div>
                  <label className="text-dark-400 text-sm">Created At</label>
                  <p className="text-white">{new Date(selectedDocument.created_at).toLocaleString()}</p>
                </div>
                {selectedDocument.processed_at && (
                  <div>
                    <label className="text-dark-400 text-sm">Processed At</label>
                    <p className="text-white">{new Date(selectedDocument.processed_at).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <label className="text-dark-400 text-sm">Bucket Path</label>
                  <p className="text-white font-mono text-sm break-all">{selectedDocument.bucket_path}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
