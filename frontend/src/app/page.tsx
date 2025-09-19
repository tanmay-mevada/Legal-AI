"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { signInWithPopup, onAuthStateChanged, type User } from "firebase/auth"
import { auth, provider } from "@/lib/firebase"
import Navbar from "./components/navbar"
import FileUploadForm from "./components/file-upload-form"
import { ShieldCheck, LogIn } from "lucide-react"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<string>("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken()
          await fetch("http://localhost:8000/api/activity/track-login", {
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
        <div className="w-full max-w-sm p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-600 rounded-lg">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Legal AI</h1>
              <p className="text-xs text-slate-600">Secure document insights</p>
            </div>
          </div>
          <button
            onClick={login}
            className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-500"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="max-w-6xl px-4 pb-12 mx-auto mt-8">
        <section className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-pretty text-slate-900">
              Welcome,{" "}
              <span className="text-blue-600">
                {user.displayName || user.email}
              </span>
            </h2>
            <span className="text-xs text-slate-600">Legal AI</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Upload agreements to extract key details and get concise AI
            summaries.
          </p>
        </section>

        <section className="p-6 bg-white border rounded-2xl border-slate-200">
          <FileUploadForm onSummary={setSummary} />
        </section>

        {summary && (
          <section className="p-4 mt-8 prose-sm prose bg-white border max-w-none text-slate-800 rounded-xl border-slate-200">
            <h2>Summary</h2>
            <ReactMarkdown>{summary}</ReactMarkdown>
          </section>
        )}
      </main>
    </div>
  )
}
