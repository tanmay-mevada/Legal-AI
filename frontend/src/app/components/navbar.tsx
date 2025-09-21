"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar({ user }: { user: import("firebase/auth").User | null }) {
  return (
    <nav className="relative z-50 border-b border-slate-200/80 dark:border-dark-800/50 glass-morphism bg-white/50 dark:bg-transparent">
      <div className="flex items-center justify-between px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-electric-400 via-primary-500 to-neural-500 rounded-xl shadow-glow-sm">
            <svg className="w-4 h-4 text-white sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <div className="text-lg font-bold sm:text-xl text-slate-900 dark:text-gradient">Legal AI</div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* ThemeToggle removed */}
          {user && (
            <>
              {/* Admin Panel Link */}
              {[
                "tanmaymevada24@gmail.com"
              ].includes(user.email || "") && (
                <a
                  href="/admin"
                  className="hidden sm:block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white transition-all duration-300 transform rounded-lg shadow-sm bg-gradient-to-r from-neural-600 to-neural-500 hover:from-neural-500 hover:to-neural-400 hover:scale-102 hover:shadow-md"
                >
                  Admin Panel
                </a>
              )}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-electric-400">
                  <span className="text-xs font-semibold text-white sm:text-sm">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="hidden text-sm font-medium text-slate-700 dark:text-dark-200 md:block sm:text-base">
                  {user.displayName || user.email}
                </span>
              </div>
              <button
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white transition-all duration-300 transform rounded-lg shadow-sm bg-gradient-to-r from-risk-600 to-risk-500 hover:from-risk-500 hover:to-risk-400 hover:scale-102 hover:shadow-md"
                onClick={() => signOut(auth)}
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}