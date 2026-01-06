"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { signupWithEmail, loginWithGoogle } from "@/lib/firebase/auth"
import { createDocument } from "@/lib/firebase/firestore"
import { MapPin, Mail } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/types"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("user")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { user, error } = await signupWithEmail(email, password)

    if (error) {
      toast({
        title: "Signup failed",
        description: error,
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (user) {
      // Create user profile in Firestore
      const { error: profileError } = await createDocument(
        "users",
        {
          email,
          name,
          role,
          trustScore: 50,
          location: {
            lat: 0,
            lng: 0,
            address: "Location not set",
          },
        },
        user.uid,
      )

      if (profileError) {
        toast({
          title: "Profile creation failed",
          description: profileError,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Welcome to LocalHelp!",
          description: "Your account has been created successfully.",
        })
        router.push("/")
      }
    }

    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    const { user, error } = await loginWithGoogle()

    if (error) {
      toast({
        title: "Signup failed",
        description: error,
        variant: "destructive",
      })
    } else if (user) {
      // Create user profile
      await createDocument(
        "users",
        {
          email: user.email,
          name: user.displayName || "User",
          role: "user",
          trustScore: 50,
        },
        user.uid,
      )
      router.push("/")
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-primary/10 px-4 py-12">
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
          <h1 className="mb-2 text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-muted-foreground">Join your local support network today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">I want to</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Find help & borrow items</SelectItem>
                <SelectItem value="technician">Offer services as a technician</SelectItem>
                <SelectItem value="item_owner">Lend my items to others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
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
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          <Mail className="h-4 w-4" />
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  )
}
