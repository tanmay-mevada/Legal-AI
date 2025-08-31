"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar({ user }: { user: import("firebase/auth").User | null }) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow mb-8">
      <div className="text-xl font-bold text-blue-600">Legal AI</div>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-gray-700">{user.displayName || user.email}</span>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => signOut(auth)}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
