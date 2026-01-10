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
      console.log("[v0] Auth state changed, user:", firebaseUser?.uid || "null")
      setUser(firebaseUser)

      if (firebaseUser) {
        console.log("[v0] Fetching user profile for:", firebaseUser.uid)

        let retries = 0
        let profile = null

        while (retries < 3 && !profile) {
          const { data } = await getDocument("users", firebaseUser.uid)
          profile = data as User | null

          if (!profile && retries < 2) {
            console.log("[v0] Profile not found, retrying in 500ms...")
            await new Promise((resolve) => setTimeout(resolve, 500))
          }
          retries++
        }

        if (profile) {
          console.log("[v0] User profile loaded:", profile.name, profile.role)
        } else {
          console.log("[v0] User profile not found after retries")
        }

        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, userProfile, loading }}>{children}</AuthContext.Provider>
}
