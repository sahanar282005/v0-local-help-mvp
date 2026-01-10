"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginWithEmail, loginWithGoogle } from "@/lib/firebase/auth"
import { MapPin, Mail } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent multiple submissions
    if (loading) return

    setLoading(true)

    console.log("[v0] Login attempt with email:", email)

    const { user, error } = await loginWithEmail(email, password)

    if (error) {
      console.log("[v0] Login error:", error)

      let errorMessage = error
      // More specific error handling
      if (error.includes("auth/invalid-credential") || error.includes("auth/wrong-password")) {
        errorMessage = "Invalid email or password. Please check your credentials and try again."
      } else if (error.includes("auth/user-not-found")) {
        errorMessage = "No account found with this email. Please sign up first."
      } else if (error.includes("auth/too-many-requests")) {
        errorMessage = "Too many failed attempts. Please try again later or reset your password."
      } else if (error.includes("auth/invalid-email")) {
        errorMessage = "Please enter a valid email address."
      } else if (error.includes("auth/network-request-failed")) {
        errorMessage = "Network error. Please check your internet connection."
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (user) {
      console.log("[v0] Login successful, user ID:", user.uid)
      console.log("[v0] Redirecting to home page...")

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      })

      // Wait longer for auth state to propagate
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.refresh()
      router.push("/")
    }

    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    console.log("[v0] Google login attempt")

    const { user, error } = await loginWithGoogle()

    if (error) {
      console.log("[v0] Google login error:", error)
      toast({
        title: "Login failed",
        description: error,
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (user) {
      console.log("[v0] Google login successful, user:", user.uid)
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      })

      await new Promise((resolve) => setTimeout(resolve, 500))
      router.refresh()
      router.push("/")
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-primary/10 px-4">
      <Card className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">LocalHelp</span>
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Login to access your local support network</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/auth/reset-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          variant="outline"
          className="w-full gap-2 bg-transparent"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <Mail className="h-4 w-4" />
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  )
}
