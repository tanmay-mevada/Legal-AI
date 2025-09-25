"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
//import { supabase } from "@/lib/supabaseClient";
import AdminDashboard from "./components/AdminDashboard";
//import AdminAuthGuard from "./components/AdminAuthGuard";

// interface Document {
//   id: string;
//   user_id: string;
//   file_name: string;
//   bucket_path: string;
//   content_type: string;
//   size_bytes: number;
//   pages: number;
//   status: string;
//   created_at: string;
//   processed_at?: string;
// }

// interface UserWithDocuments {
//   uid: string;
//   email: string;
//   displayName: string;
//   lastSignInTime: string;
//   documents: Document[];
//   totalDocuments: number;
//   totalSize: number;
// }

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check if user is admin (you can customize this logic)
        const adminEmails = [
          "tanmaymevada24@gmail.com"
        ];
        setIsAdmin(adminEmails.includes(firebaseUser.email || ""));
      }
      setLoading(false);
    });
    return () => unsubscribe(); 
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 mb-4 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-lg font-medium text-gray-600 dark:text-gray-300 animate-pulse">
          Loading Admin Panel...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="mb-8 text-gray-600 dark:text-gray-300">Please sign in to access the admin panel</p>
          <button
            onClick={() => window.location.href = "/"}
            className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
          <p className="mb-8 text-gray-600 dark:text-gray-300">You don&apos;t have admin privileges</p>
          <button
            onClick={() => window.location.href = "/"}
            className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminDashboard />
    </div>
  );
}
