"use client";
import type { UserWithDocuments } from "./AdminDashboard";

interface StatsOverviewProps {
  users: UserWithDocuments[];
}

export default function StatsOverview({ users }: StatsOverviewProps) {
  const totalUsers = Array.isArray(users) ? users.length : 0;
  const totalDocuments = Array.isArray(users)
    ? users.reduce((sum, user) => sum + (user.totalDocuments || (user.documents ? user.documents.length : 0)), 0)
    : 0;
  const totalSize = Array.isArray(users)
    ? users.reduce((sum, user) => sum + (user.totalSize || 0), 0)
    : 0;

  const statusCounts = Array.isArray(users)
    ? users.reduce((acc, user) => {
        (user.documents || []).forEach((doc: { status: string }) => {
          acc[doc.status] = (acc[doc.status] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>)
    : {};

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

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

  return (
    <>
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="p-6 border bg-dark-800/50 backdrop-blur-sm border-dark-700 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-dark-400">Total Users</p>
              <p className="text-3xl font-bold text-white">{totalUsers}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-500/20">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        {/* Total Documents */}
        <div className="p-6 border bg-dark-800/50 backdrop-blur-sm border-dark-700 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-dark-400">Total Documents</p>
              <p className="text-3xl font-bold text-white">{totalDocuments}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-electric-500/20">
              <span className="text-2xl">📄</span>
            </div>
          </div>
        </div>

        {/* Total Storage */}
        <div className="p-6 border bg-dark-800/50 backdrop-blur-sm border-dark-700 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-dark-400">Total Storage</p>
              <p className="text-3xl font-bold text-white">{formatFileSize(totalSize)}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-neural-500/20">
              <span className="text-2xl">💾</span>
            </div>
          </div>
        </div>

        {/* Average per User */}
        <div className="p-6 border bg-dark-800/50 backdrop-blur-sm border-dark-700 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-dark-400">Avg per User</p>
              <p className="text-3xl font-bold text-white">
                {totalUsers > 0 ? Math.round(totalDocuments / totalUsers) : 0}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-safe-500/20">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Status Breakdown */}
      <div className="p-6 mb-8 border bg-dark-800/50 backdrop-blur-sm border-dark-700 rounded-xl">
        <h3 className="mb-4 text-lg font-semibold text-white">Document Status Overview</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className={`inline-block px-3 py-2 rounded-lg ${getStatusColor(status)} mb-2`}>
                <span className="text-2xl font-bold">{count as number}</span>
              </div>
              <p className="text-sm capitalize text-dark-400">{status}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
