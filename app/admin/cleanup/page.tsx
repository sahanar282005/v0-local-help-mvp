"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, AlertTriangle } from "lucide-react"

export default function CleanupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleDeleteAll = async () => {
    if (
      !confirm(
        "⚠️ WARNING: This will delete ALL users from Firebase Authentication and Firestore. This action cannot be undone. Are you absolutely sure?",
      )
    ) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/delete-all-users", {
        method: "POST",
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete users",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Account Cleanup</h1>
          <p className="text-muted-foreground">Development utility for clearing test accounts</p>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>DANGER ZONE:</strong> This tool is for development only. It will permanently delete all user
            accounts.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Delete All User Accounts</CardTitle>
            <CardDescription>
              This will delete all users from Firebase Authentication and their associated data from Firestore. Use this
              to clear test accounts during development.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleDeleteAll} disabled={loading} variant="destructive" className="w-full">
              {loading ? (
                "Deleting..."
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All Accounts
                </>
              )}
            </Button>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>After deleting all accounts:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Go to /auth/signup to create a fresh account</li>
              <li>Use a new email and password you'll remember</li>
              <li>You'll be automatically logged in after signup</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
