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
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-dark-950 bg-neural">
        <div className="w-16 h-16 mb-4 border-4 rounded-full border-dark-700 border-t-electric-400 animate-spin"></div>
        <span className="text-lg font-medium text-dark-300 animate-pulse">
          Loading...
        </span>
      </div>
    );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-950 bg-neural">
        <div className="flex flex-col items-center w-full max-w-md p-8 mx-4 border glass-morphism rounded-3xl border-dark-700/50 shadow-glow">
          <div className="mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-electric-400 via-primary-500 to-neural-500 rounded-2xl shadow-glow animate-float">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gradient">
            Welcome to Legal AI
          </h1>
          <p className="mb-8 text-center text-dark-300">
            Sign in to get started.
            <br />
            <span className="text-electric-300">
              Your documents are secure and private.
            </span>
          </p>
          <button
            onClick={login}
            className="relative flex items-center justify-center w-full gap-3 px-6 py-3 overflow-hidden text-lg font-semibold text-white transition-all duration-300 transform bg-gradient-to-r from-primary-600 to-electric-500 hover:from-primary-500 hover:to-electric-400 rounded-xl shadow-glow hover:shadow-glow-lg hover:scale-102 group"
          >
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-white/10 to-transparent group-hover:opacity-100"></div>
            <svg className="relative z-10 w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path
                d="M21.35 11.1h-9.18v2.98h5.27c-.23 1.25-1.39 3.67-5.27 3.67-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.81 0 3.02.77 3.72 1.43l2.54-2.47C16.13 4.6 14.36 3.7 12.17 3.7c-4.7 0-8.52 3.81-8.52 8.5s3.82 8.5 8.52 8.5c4.92 0 8.18-3.45 8.18-8.3 0-.56-.06-1.1-.15-1.6z"
                fill="currentColor"
              />
            </svg>
            <span className="relative z-10">Continue with Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 bg-neural">
      <Navbar user={user} />
      <main className="max-w-xl p-6 mx-auto mt-10">
        <div className="p-8 border glass-morphism rounded-3xl shadow-glow border-dark-700/50">
          <h2 className="mb-4 text-3xl font-bold">
            <span className="text-white">Welcome, </span>
            <span className="text-gradient">
              {user.displayName || user.email}!
            </span>
          </h2>
          <p className="mb-6 leading-relaxed text-dark-300">
            Upload your rental agreements, contracts, or other documents below
            to get instant AI-powered analysis.
          </p>
          <FileUploadForm />
        </div>
      </main>
    </div>
  );
}