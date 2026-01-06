"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User as FirebaseUser } from "firebase/auth"
import { subscribeToAuthChanges } from "@/lib/firebase/auth"
import { getDocument } from "@/lib/firebase/firestore"
import type { User } from "@/types"

interface AuthContextType {
  user: FirebaseUser | null
  userProfile: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        // Fetch user profile from Firestore
        const { data } = await getDocument("users", firebaseUser.uid)
        setUserProfile(data as User | null)
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, userProfile, loading }}>{children}</AuthContext.Provider>
}
