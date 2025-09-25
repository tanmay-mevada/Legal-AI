"use client"

import { useEffect, useState } from "react"
import { signInWithPopup, onAuthStateChanged, type User } from "firebase/auth"
import { auth, provider } from "@/lib/firebase"
import { API_URLS } from "@/lib/config"
import ChatLayout from "./components/chat/ChatLayout"
import { ShieldCheck, LogIn } from "lucide-react"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken()
          await fetch(API_URLS.TRACK_LOGIN, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
        } catch (error) {
          console.error("Failed to track login:", error)
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const login = async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin border-slate-300 border-t-blue-600" />
          <span className="text-sm text-slate-600">Loading</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-background">
        <div className="w-full max-w-sm p-4 bg-white border shadow-sm sm:p-6 rounded-2xl border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-600 rounded-lg sm:w-10 sm:h-10">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-base font-semibold sm:text-lg text-slate-900">TautologyAI</h1>
              <p className="text-xs text-slate-600">Secure document insights</p>
            </div>
          </div>
          <button
            onClick={login}
            className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 sm:px-4 py-2 sm:py-2.5 font-medium text-white transition-colors hover:bg-blue-500 text-sm sm:text-base"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    )
  }

  return <ChatLayout user={user} />
}
