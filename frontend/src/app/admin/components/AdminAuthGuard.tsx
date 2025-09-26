"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isUserAdmin } from "@/lib/admin";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check if user is admin using centralized configuration
        setIsAdmin(isUserAdmin(firebaseUser.email));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-dark-950 bg-neural">
        <div className="w-16 h-16 mb-4 border-4 rounded-full border-dark-700 border-t-electric-400 animate-spin"></div>
        <span className="text-lg font-medium text-dark-300 animate-pulse">
          Verifying admin access...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-dark-950 bg-neural">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold text-gradient">Admin Access Required</h1>
          <p className="mb-8 text-dark-300">Please sign in to access the admin panel</p>
          <button
            onClick={() => window.location.href = "/"}
            className="px-6 py-3 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-dark-950 bg-neural">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold text-gradient">Access Denied</h1>
          <p className="mb-4 text-dark-300">You dont have admin privileges</p>
          <p className="mb-8 text-sm text-dark-400">
            Current user: {user.email}
          </p>
          <button
            onClick={() => window.location.href = "/"}
            className="px-6 py-3 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
