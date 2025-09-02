"use client";
import type { Document, UserWithDocuments } from "./AdminDashboard";

// type UserWithDocuments imported above

interface UserCardProps {
  user: UserWithDocuments;
  onSelect: () => void;
  formatFileSize: (bytes: number) => string;
}

export default function UserCard({ user, onSelect, formatFileSize }: UserCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed":
        return "text-safe-400 bg-safe-900/20";
      case "processing":
        return "text-primary-400 bg-primary-900/20";
      case "failed":
        return "text-risk-400 bg-risk-900/20";
      case "uploaded":
        return "text-electric-400 bg-electric-900/20";
      default:
        return "text-dark-400 bg-dark-800/20";
    }
  };

  const getStatusCounts = () => {
    const counts = user.documents.reduce((acc: Record<string, number>, doc: Document) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return counts;
  };

  const statusCounts = getStatusCounts();
  const lastActivity = new Date(user.lastSignInTime).toLocaleDateString();

  return (
    <div 
      className="p-6 transition-all duration-300 border cursor-pointer bg-dark-800/50 backdrop-blur-sm border-dark-700 rounded-xl hover:bg-dark-800/70 hover-lift"
      onClick={onSelect}
    >
      {/* User Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="mb-1 text-xl font-semibold text-white">{user.displayName}</h3>
          <p className="text-sm text-dark-400">{user.email}</p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-electric-500">
          <span className="text-lg font-bold text-white">
            {user.displayName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary-400">{user.totalDocuments}</p>
          <p className="text-sm text-dark-400">Documents</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-electric-400">{formatFileSize(user.totalSize)}</p>
          <p className="text-sm text-dark-400">Total Size</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-neural-400">{user.loginCount}</p>
          <p className="text-sm text-dark-400">Logins</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="mb-4">
        <p className="mb-2 text-sm text-dark-300">Document Status:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <span
              key={status}
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
            >
              {status}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Last Activity */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-dark-400">Last Activity:</span>
        <span className="text-dark-300">{lastActivity}</span>
      </div>

      {/* View Details Button */}
      <div className="pt-4 mt-4 border-t border-dark-700">
        <button className="w-full py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700">
          View Details
        </button>
      </div>
    </div>
  );
}
