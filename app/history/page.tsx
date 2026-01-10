"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Package, Wrench, AlertCircle, Clock, CheckCircle, XCircle, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { subscribeToQuery, where } from "@/lib/firebase/firestore"
import type { Request } from "@/types"

export default function HistoryPage() {
  const { userProfile } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userProfile?.id) return

    const unsubscribe = subscribeToQuery("requests", [where("createdBy", "==", userProfile.id)], (data) => {
      setRequests(data as Request[])
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userProfile?.id])

  const borrowRequests = requests.filter((r) => r.type === "borrow")
  const techRequests = requests.filter((r) => r.type === "service")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "created":
        return <Clock className="h-4 w-4 text-warning" />
      case "accepted":
      case "in_progress":
        return <AlertCircle className="h-4 w-4 text-primary" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "rejected":
      case "cancelled":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "created":
        return "text-warning bg-warning/10"
      case "accepted":
      case "in_progress":
        return "text-primary bg-primary/10"
      case "completed":
        return "text-success bg-success/10"
      case "rejected":
      case "cancelled":
        return "text-destructive bg-destructive/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "text-emergency bg-emergency/10 border-emergency"
      case "priority":
        return "text-warning bg-warning/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

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
          <span className="font-semibold">Activity History</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">Your Activity</h1>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
            <TabsTrigger value="borrow" className="gap-2">
              <Package className="h-4 w-4" />
              Borrow ({borrowRequests.length})
            </TabsTrigger>
            <TabsTrigger value="technician" className="gap-2">
              <Wrench className="h-4 w-4" />
              Technician ({techRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : requests.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No activity yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start using LocalHelp to see your requests and bookings here.
                </p>
              </Card>
            ) : (
              requests
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                .map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    getUrgencyColor={getUrgencyColor}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="borrow" className="space-y-4">
            {borrowRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No borrow requests</h3>
                <p className="text-sm text-muted-foreground">You haven't borrowed any items yet.</p>
              </Card>
            ) : (
              borrowRequests
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                .map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    getUrgencyColor={getUrgencyColor}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="technician" className="space-y-4">
            {techRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <Wrench className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No technician bookings</h3>
                <p className="text-sm text-muted-foreground">You haven't booked any technicians yet.</p>
              </Card>
            ) : (
              techRequests
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                .map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    getUrgencyColor={getUrgencyColor}
                  />
                ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function RequestCard({
  request,
  getStatusColor,
  getStatusIcon,
  getUrgencyColor,
}: {
  request: Request
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => React.ReactNode
  getUrgencyColor: (urgency: string) => string
}) {
  const statusColor = getStatusColor(request.status)
  const urgencyColor = getUrgencyColor(request.urgency)

  return (
    <Card className="p-4 transition-all hover:shadow-md">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
            request.type === "borrow" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
          }`}
        >
          {request.type === "borrow" ? <Package className="h-6 w-6" /> : <Wrench className="h-6 w-6" />}
        </div>

        <div className="flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold">{request.type === "borrow" ? request.itemName : request.description}</h3>
              <p className="text-sm text-muted-foreground">
                {request.type === "borrow" ? `from ${request.targetName || "Owner"}` : `by ${request.targetName}`}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge className={statusColor}>{request.status}</Badge>
              {request.urgency !== "normal" && <Badge className={urgencyColor}>{request.urgency}</Badge>}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {request.location?.address && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{request.location.address}</span>
              </div>
            )}
            {request.price && (
              <div className="flex items-center gap-1 font-semibold text-success">
                <DollarSign className="h-3 w-3" />
                <span>${request.price}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(request.createdAt?.seconds * 1000).toLocaleString()}</span>
            </div>
          </div>

          {request.acceptedAt && (
            <div className="mt-2 text-xs text-success">
              Accepted on {new Date(request.acceptedAt?.seconds * 1000).toLocaleString()}
            </div>
          )}
          {request.status === "rejected" && request.rejectedReason && (
            <div className="mt-2 text-xs text-destructive">Rejected: {request.rejectedReason}</div>
          )}
        </div>
      </div>
    </Card>
  )
}
