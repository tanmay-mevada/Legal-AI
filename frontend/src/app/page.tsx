"use client";
import { useEffect, useState } from "react";
import { signInWithPopup, onAuthStateChanged, User } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";

import FileUploadForm from "./FileUploadForm";
import Navbar from "./Navbar";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    await signInWithPopup(auth, provider);
    // user state will update automatically
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800">
      <span className="text-lg text-gray-700 dark:text-gray-200">Loading...</span>
    </div>
  );
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center w-full max-w-md p-8 bg-white border border-gray-200 shadow-xl rounded-2xl dark:bg-gray-900 dark:border-gray-700">
          <div className="mb-6">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="12" fill="#2563eb"/>
              <path d="M7 17V7h10v10H7zm2-2h6V9H9v6z" fill="#fff"/>
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">Welcome to Legal AI</h1>
          <p className="mb-8 text-center text-gray-500 dark:text-gray-300">
            Sign in to get started.<br />Your documents are secure and private.
          </p>
          <button
            onClick={login}
            className="flex items-center justify-center w-full gap-3 px-6 py-3 text-lg font-semibold text-white transition bg-blue-500 rounded-full shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21.35 11.1h-9.18v2.98h5.27c-.23 1.25-1.39 3.67-5.27 3.67-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.81 0 3.02.77 3.72 1.43l2.54-2.47C16.13 4.6 14.36 3.7 12.17 3.7c-4.7 0-8.52 3.81-8.52 8.5s3.82 8.5 8.52 8.5c4.92 0 8.18-3.45 8.18-8.3 0-.56-.06-1.1-.15-1.6z" fill="#fff"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }
  return (
    <>
      <Navbar user={user} />
      <main className="max-w-xl p-6 mx-auto mt-10 bg-white rounded shadow">
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">Welcome, {user.displayName || user.email}!</h2>
        <p className="mb-6 text-gray-600">Upload your rental agreements, contracts, or other documents below.</p>
        <FileUploadForm />
      </main>
    </>
  );
}