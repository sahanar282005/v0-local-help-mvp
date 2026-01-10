"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useRequestStatus } from "@/lib/hooks/use-request-status"
import { updateDocument } from "@/lib/firebase/firestore"
import { useState, useEffect } from "react"
import { MapPin, Navigation, Clock, DollarSign, CheckCircle, User, ArrowLeft } from "lucide-react"

export default function JobDetailsPage() {
  const { id } = useParams()
  const { userProfile } = useAuth()
  const router = useRouter()
  const { request, loading } = useRequestStatus(id as string)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (userProfile?.role !== "technician") {
      router.push("/")
    }
  }, [userProfile, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Request not found</p>
      </div>
    )
  }

  const handleStartJob = async () => {
    setUpdating(true)
    await updateDocument("requests", request.id, {
      status: "in_progress",
    })
    setUpdating(false)
  }

  const handleCompleteJob = async () => {
    setUpdating(true)
    await updateDocument("requests", request.id, {
      status: "completed",
      completedTime: new Date(),
    })
    setUpdating(false)
    router.push("/technician-dashboard")
  }

  const openInGoogleMaps = () => {
    if (request.location) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${request.location.lat},${request.location.lng}`
      window.open(url, "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/technician-dashboard" className="flex items-center gap-2 font-bold">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* Status Badge */}
        <div className="mb-6">
          <StatusBadge status={request.status} urgency={request.urgency} />
        </div>

        {/* Job Details Card */}
        <Card className="mb-6 p-6">
          <h1 className="mb-4 text-2xl font-bold">{request.description}</h1>

          <div className="space-y-4">
            <DetailRow icon={<User />} label="Customer" value={request.createdByName} />
            <DetailRow icon={<MapPin />} label="Location" value={request.location?.address || "Not specified"} />
            <DetailRow icon={<DollarSign />} label="Payment" value={`$${request.price || 0}`} />
            <DetailRow
              icon={<Clock />}
              label="Requested"
              value={new Date(request.createdAt?.seconds * 1000).toLocaleString()}
            />
          </div>
        </Card>

        {/* Map Navigation */}
        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-xl font-semibold">Navigation</h2>
          <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center mb-4">
            <MapPin className="h-12 w-12 text-muted-foreground" />
          </div>
          <Button onClick={openInGoogleMaps} className="w-full gap-2">
            <Navigation className="h-4 w-4" />
            Open in Google Maps
          </Button>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {request.status === "accepted" && (
            <Button onClick={handleStartJob} disabled={updating} className="flex-1 gap-2">
              <Clock className="h-4 w-4" />
              Start Job
            </Button>
          )}
          {request.status === "in_progress" && (
            <Button
              onClick={handleCompleteJob}
              disabled={updating}
              className="flex-1 gap-2 bg-success hover:bg-success/90"
            >
              <CheckCircle className="h-4 w-4" />
              Mark as Completed
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}

function StatusBadge({ status, urgency }: { status: string; urgency: string }) {
  const getStatusColor = () => {
    switch (status) {
      case "accepted":
        return "bg-primary"
      case "in_progress":
        return "bg-warning"
      case "completed":
        return "bg-success"
      default:
        return "bg-muted"
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case "accepted":
        return "Accepted"
      case "in_progress":
        return "In Progress"
      case "completed":
        return "Completed"
      default:
        return status
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${getStatusColor()} text-white`}>{getStatusLabel()}</Badge>
      {urgency === "emergency" && (
        <Badge variant="destructive" className="emergency-pulse">
          EMERGENCY
        </Badge>
      )}
      {urgency === "priority" && <Badge variant="secondary">Priority</Badge>}
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}
