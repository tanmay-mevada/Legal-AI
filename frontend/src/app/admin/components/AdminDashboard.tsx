"use client";
import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";
import { auth } from "@/lib/firebase";
import UserCard from "./UserCard";
import DocumentViewer from "./DocumentViewer";
import StatsOverview from "./StatsOverview";

export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  bucket_path: string;
  content_type: string;
  size_bytes: number;
  pages: number;
  status: string;
  created_at: string;
  processed_at?: string;
}

export interface UserWithDocuments {
  uid: string;
  email: string;
  displayName: string;
  lastSignInTime: string;
  loginCount: number;
  documents: Document[];
  totalDocuments: number;
  totalSize: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithDocuments | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "documents" | "lastLogin" | "size">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      
      // Get current user token for authentication
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("No authenticated user");
        return;
      }

      const token = await currentUser.getIdToken();
      
      // Fetch users from backend API
      const response = await fetch("https://legal-ai-backend-63563783552.us-central1.run.app/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedUsers = users
    .filter((user: UserWithDocuments) =>
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: UserWithDocuments, b: UserWithDocuments) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.displayName.localeCompare(b.displayName);
          break;
        case "documents":
          comparison = a.totalDocuments - b.totalDocuments;
          break;
        case "lastLogin":
          comparison = new Date(a.lastSignInTime).getTime() - new Date(b.lastSignInTime).getTime();
          break;
        case "size":
          comparison = a.totalSize - b.totalSize;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-16 h-16 mb-4 border-4 rounded-full border-dark-700 border-t-electric-400 animate-spin"></div>
        <span className="text-lg font-medium text-dark-300 animate-pulse">
          Loading users...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-gradient">Admin Dashboard</h1>
        <p className="text-dark-300">Manage users and monitor document activity</p>
      </div>

      {/* Stats Overview */}
      <StatsOverview users={users} />

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 text-white border rounded-lg bg-dark-800 border-dark-700 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "documents" | "lastLogin" | "size")}
            className="px-4 py-2 text-white border rounded-lg bg-dark-800 border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="name">Sort by Name</option>
            <option value="documents">Sort by Documents</option>
            <option value="lastLogin">Sort by Last Activity</option>
            <option value="size">Sort by Total Size</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-4 py-2 text-white transition-colors border rounded-lg bg-dark-800 border-dark-700 hover:bg-dark-700"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedUsers.map((user) => (
          <UserCard
            key={user.uid}
            user={user}
            onSelect={() => setSelectedUser(user)}
            formatFileSize={formatFileSize}
          />
        ))}
      </div>

      {filteredAndSortedUsers.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-dark-400">No users found</p>
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedUser && (
        <DocumentViewer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          formatFileSize={formatFileSize}
        />
      )}
    </div>
  );
}
