"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MapPin, Shield, Star, Edit, LogOut } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { updateDocument } from "@/lib/firebase/firestore"
import { logout } from "@/lib/firebase/auth"
import { getTrustBadge } from "@/lib/mock-ai/trust-score"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/types"

export default function ProfilePage() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    phone: userProfile?.phone || "",
    role: userProfile?.role || "user",
    emergencyAvailable: (userProfile as any)?.emergencyAvailable || false,
  })

  const handleSave = async () => {
    if (!userProfile) return

    setSaving(true)
    const { error } = await updateDocument("users", userProfile.id, formData)

    if (error) {
      toast({
        title: "Update failed",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved.",
      })
      setEditing(false)
    }

    setSaving(false)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/auth/login")
  }

  if (!userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const trustBadge = getTrustBadge(userProfile.trustScore)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="font-semibold">My Profile</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Profile Header Card */}
        <Card className="mb-6 p-6">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-bold">
                {userProfile.name.charAt(0)}
              </div>
              <div>
                <h1 className="mb-1 text-2xl font-bold">{userProfile.name}</h1>
                <p className="text-sm text-muted-foreground">{userProfile.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={trustBadge.variant} className="gap-1">
              <Shield className="h-3 w-3" />
              {trustBadge.label}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Star className="h-3 w-3 fill-warning text-warning" />
              Trust Score: {userProfile.trustScore}/100
            </Badge>
            <Badge variant="secondary">{userProfile.role.replace("_", " ").toUpperCase()}</Badge>
          </div>
        </Card>

        {/* Profile Details */}
        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-lg font-semibold">Profile Information</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={userProfile.email} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                disabled={!editing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="item_owner">Item Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === "technician" && (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="emergency" className="cursor-pointer">
                    Emergency Availability
                  </Label>
                  <p className="text-xs text-muted-foreground">Make yourself available for 24/7 emergencies</p>
                </div>
                <Switch
                  id="emergency"
                  checked={formData.emergencyAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, emergencyAvailable: checked })}
                  disabled={!editing}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Location</Label>
              <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{userProfile.location?.address || "No location set"}</span>
              </div>
            </div>

            {editing && (
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)} className="flex-1 bg-transparent">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Account Actions</h2>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" asChild>
              <Link href="/history">
                <Star className="h-4 w-4" />
                View Activity History
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive bg-transparent hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
