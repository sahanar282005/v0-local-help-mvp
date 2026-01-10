"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { auth, db } from "@/lib/firebase/config"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export default function AuthTestPage() {
  const [firebaseStatus, setFirebaseStatus] = useState({
    auth: false,
    firestore: false,
    config: false,
  })
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    // Check Firebase configuration
    const checkFirebase = () => {
      const configOk = !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      )

      setFirebaseStatus({
        auth: !!auth,
        firestore: !!db,
        config: configOk,
      })

      const results = []
      results.push(`API Key: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✓ Set" : "✗ Missing"}`)
      results.push(`Auth Domain: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✓ Set" : "✗ Missing"}`)
      results.push(`Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✓ Set" : "✗ Missing"}`)
      results.push(`Auth Instance: ${auth ? "✓ Initialized" : "✗ Not initialized"}`)
      results.push(`Firestore Instance: ${db ? "✓ Initialized" : "✗ Not initialized"}`)

      setTestResults(results)
    }

    checkFirebase()
  }, [])

  const allGood = firebaseStatus.auth && firebaseStatus.firestore && firebaseStatus.config

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl p-8">
        <h1 className="mb-6 text-2xl font-bold">Firebase Authentication Test</h1>

        <Alert className={allGood ? "border-green-500" : "border-red-500"}>
          {allGood ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
          <AlertDescription>
            {allGood
              ? "Firebase is properly configured and ready to use"
              : "Firebase configuration is incomplete or missing"}
          </AlertDescription>
        </Alert>

        <div className="mt-6 space-y-2">
          <h2 className="text-lg font-semibold">Configuration Status:</h2>
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {result.includes("✓") ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>{result}</span>
            </div>
          ))}
        </div>

        {!allGood && (
          <Alert className="mt-6 border-yellow-500">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription>
              <strong>Fix Required:</strong> Please add your Firebase credentials to the environment variables in the
              project settings. Go to the "Vars" section in the sidebar and ensure all NEXT_PUBLIC_FIREBASE_* variables
              are set correctly.
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-8 flex gap-4">
          <Button onClick={() => (window.location.href = "/auth/signup")}>Go to Signup</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/auth/login")}>
            Go to Login
          </Button>
        </div>

        <div className="mt-8 rounded-lg bg-muted p-4">
          <h3 className="mb-2 font-semibold">Common Issues:</h3>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>If you see "email-already-in-use": The account exists, try logging in instead</li>
            <li>If you see "invalid-credential": The password is incorrect for that email</li>
            <li>If buttons don't respond: Check the browser console for errors</li>
            <li>Make sure all Firebase environment variables are set correctly</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
