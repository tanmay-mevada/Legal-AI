
"use client";
import { useEffect, useState } from "react";
import { signInWithPopup, onAuthStateChanged, User } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";

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

  if (loading) return <div>Loading...</div>;
  if (!user) {
    return <button onClick={login}>Continue with Google</button>;
  }
  return <div>Hello {user?.displayName || "user"}</div>;
}
