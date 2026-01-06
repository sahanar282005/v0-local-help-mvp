"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { MapPin, ArrowLeft, Shield, Star, AlertCircle, Package } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getDocument, createDocument } from "@/lib/firebase/firestore"
import { getTrustBadge } from "@/lib/mock-ai/trust-score"
import { detectUrgency } from "@/lib/mock-ai/urgency-detector"
import type { Item } from "@/types"
import { useToast } from "@/hooks/use-toast"

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile } = useAuth()
  const { toast } = useToast()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [notes, setNotes] = useState("")

  useEffect(() => {
    loadItem()
  }, [params.id])

  const loadItem = async () => {
    const { data } = await getDocument("items", params.id as string)
    setItem(data as Item)
    setLoading(false)
  }

  const handleBorrowRequest = async () => {
    if (!item || !userProfile || !startDate || !endDate) return

    setRequesting(true)

    const urgency = detectUrgency(notes, {
      keywords: [],
      timeOfDay: new Date().getHours(),
    })

    const { id, error } = await createDocument("borrow_requests", {
      itemId: item.id,
      itemName: item.name,
      borrowerId: userProfile.id,
      borrowerName: userProfile.name,
      ownerId: item.ownerId,
      status: "pending",
      urgency,
      startDate,
      endDate,
      depositPaid: false,
      location: item.location,
      notes,
    })

    if (error) {
      toast({
        title: "Request failed",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Request sent!",
        description: "The owner will be notified of your request.",
      })
      router.push("/history")
    }

    setRequesting(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Item not found</h2>
          <Button asChild className="mt-4">
            <Link href="/borrow">Back to Browse</Link>
          </Button>
        </div>
      </div>
    )
  }

  const trustBadge = getTrustBadge(item.trustScore)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/borrow">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="font-semibold">Item Details</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left: Item Info */}
          <div className="space-y-6">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
              <img
                src={item.image || `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <div className="mb-2 flex items-start justify-between">
                <h1 className="text-3xl font-bold text-balance">{item.name}</h1>
                <Badge variant={trustBadge.variant} className="gap-1">
                  <Shield className="h-3 w-3" />
                  {trustBadge.label}
                </Badge>
              </div>
              <p className="text-muted-foreground">{item.description}</p>
            </div>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Deposit</span>
                  <span className="font-semibold text-primary">${item.depositAmount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-4 w-4" />
                    0.5 km away
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Owner</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.ownerName}</span>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      4.8
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Booking Form */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Request to Borrow</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} className="rounded-lg border" />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} className="rounded-lg border" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Tell the owner why you need this item..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="rounded-lg bg-muted p-4 text-sm">
                  <div className="mb-2 flex items-center gap-2 font-semibold">
                    <AlertCircle className="h-4 w-4" />
                    Booking Summary
                  </div>
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Deposit (refundable)</span>
                      <span>${item.depositAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration</span>
                      <span>
                        {startDate && endDate
                          ? `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days`
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBorrowRequest}
                  disabled={!startDate || !endDate || requesting}
                >
                  {requesting ? "Sending request..." : "Send Borrow Request"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
