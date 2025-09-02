"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import ThemeToggle from "./components/ThemeToggle";

export default function Navbar({ user }: { user: import("firebase/auth").User | null }) {
  return (
    <nav className="relative z-50 border-b border-slate-200/80 dark:border-dark-800/50 glass-morphism bg-white/50 dark:bg-transparent">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-electric-400 via-primary-500 to-neural-500 rounded-xl shadow-glow-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-gradient">Legal AI</div>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && (
            <>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-electric-400">
                  <span className="text-sm font-semibold text-white">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="hidden font-medium text-slate-700 dark:text-dark-200 sm:block">
                  {user.displayName || user.email}
                </span>
              </div>
              <button
                className="px-4 py-2 font-medium text-white transition-all duration-300 transform rounded-lg shadow-sm bg-gradient-to-r from-risk-600 to-risk-500 hover:from-risk-500 hover:to-risk-400 hover:scale-102 hover:shadow-md"
                onClick={() => signOut(auth)}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}