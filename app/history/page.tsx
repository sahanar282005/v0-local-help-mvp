"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Package, Wrench, AlertCircle, Clock, CheckCircle, XCircle, MapPin } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { queryDocuments, where } from "@/lib/firebase/firestore"
import { getUrgencyColor, getUrgencyLabel } from "@/lib/mock-ai/urgency-detector"
import type { BorrowRequest, TechnicianRequest } from "@/types"

export default function HistoryPage() {
  const { userProfile } = useAuth()
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([])
  const [techRequests, setTechRequests] = useState<TechnicianRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile) {
      loadHistory()
    }
  }, [userProfile])

  const loadHistory = async () => {
    if (!userProfile) return

    // Load borrow requests
    const { data: borrowData } = await queryDocuments("borrow_requests", [where("borrowerId", "==", userProfile.id)])
    setBorrowRequests(borrowData as BorrowRequest[])

    // Load technician requests
    const { data: techData } = await queryDocuments("technician_requests", [where("userId", "==", userProfile.id)])
    setTechRequests(techData as TechnicianRequest[])

    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />
      case "accepted":
      case "in_progress":
        return <AlertCircle className="h-4 w-4 text-primary" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-warning bg-warning/10"
      case "accepted":
      case "in_progress":
        return "text-primary bg-primary/10"
      case "completed":
        return "text-success bg-success/10"
      case "cancelled":
        return "text-destructive bg-destructive/10"
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
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="borrow" className="gap-2">
              <Package className="h-4 w-4" />
              Borrow
            </TabsTrigger>
            <TabsTrigger value="technician" className="gap-2">
              <Wrench className="h-4 w-4" />
              Technician
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : borrowRequests.length === 0 && techRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No activity yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start using LocalHelp to see your requests and bookings here.
                </p>
              </Card>
            ) : (
              <>
                {borrowRequests.map((request) => (
                  <RequestCard key={request.id} request={request} type="borrow" />
                ))}
                {techRequests.map((request) => (
                  <RequestCard key={request.id} request={request} type="technician" />
                ))}
              </>
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
              borrowRequests.map((request) => <RequestCard key={request.id} request={request} type="borrow" />)
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
              techRequests.map((request) => <RequestCard key={request.id} request={request} type="technician" />)
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )

  function RequestCard({ request, type }: { request: any; type: "borrow" | "technician" }) {
    const urgencyColor = getUrgencyColor(request.urgency)
    const urgencyLabel = getUrgencyLabel(request.urgency)
    const statusColor = getStatusColor(request.status)

    return (
      <Card className="p-4 transition-all hover:shadow-md">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${type === "borrow" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"}`}
          >
            {type === "borrow" ? <Package className="h-6 w-6" /> : <Wrench className="h-6 w-6" />}
          </div>

          <div className="flex-1">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="font-semibold">
                  {type === "borrow" ? request.itemName : request.service || "Service Request"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {type === "borrow" ? `from ${request.ownerName || "Owner"}` : `by ${request.technicianName}`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className={statusColor}>{request.status}</Badge>
                {request.urgency !== "normal" && <Badge className={urgencyColor}>{urgencyLabel}</Badge>}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {request.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{request.location.address || "Location"}</span>
                </div>
              )}
              {type === "technician" && request.estimatedPrice && (
                <div className="font-semibold text-success">${request.estimatedPrice}</div>
              )}
              {type === "borrow" && request.depositAmount && (
                <div className="font-semibold text-primary">${request.depositAmount} deposit</div>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }
}
