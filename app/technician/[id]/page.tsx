"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { MapPin, ArrowLeft, Shield, Star, AlertCircle, Wrench, Clock, Zap, CheckCircle, Award } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getDocument, createDocument } from "@/lib/firebase/firestore"
import { getTrustBadge } from "@/lib/mock-ai/trust-score"
import { detectUrgency } from "@/lib/mock-ai/urgency-detector"
import { calculateFairPrice } from "@/lib/mock-ai/pricing-engine"
import type { Technician } from "@/types"
import { useToast } from "@/hooks/use-toast"

export default function TechnicianDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile } = useAuth()
  const { toast } = useToast()
  const [technician, setTechnician] = useState<Technician | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [serviceDescription, setServiceDescription] = useState("")

  useEffect(() => {
    loadTechnician()
  }, [params.id])

  const loadTechnician = async () => {
    const { data } = await getDocument("users", params.id as string)
    setTechnician(data as Technician)
    setLoading(false)
  }

  const handleBookRequest = async () => {
    if (!technician || !userProfile || !selectedDate) return

    setRequesting(true)

    const urgency = detectUrgency(serviceDescription, {
      keywords: [],
      timeOfDay: new Date().getHours(),
    })

    const estimatedPrice = calculateFairPrice({
      serviceType: technician.skills[0]?.toLowerCase() || "default",
      urgency,
      distance: 1.2,
      timeOfDay: selectedDate.getHours(),
    })

    const { id, error } = await createDocument("requests", {
      type: "service",
      createdBy: userProfile.id,
      createdByName: userProfile.name,
      targetId: technician.id,
      targetName: technician.name,
      service: technician.skills[0] || "Service",
      description: serviceDescription,
      status: "pending",
      urgency,
      price: estimatedPrice,
      location: userProfile.location,
      scheduledTime: selectedDate,
    })

    if (error) {
      toast({
        title: "Request failed",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Booking request sent!",
        description: "The technician will respond shortly.",
      })
      router.push("/history")
    }

    setRequesting(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-success border-t-transparent" />
      </div>
    )
  }

  if (!technician) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Wrench className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Technician not found</h2>
          <Button asChild className="mt-4">
            <Link href="/technician">Back to Browse</Link>
          </Button>
        </div>
      </div>
    )
  }

  const trustBadge = getTrustBadge(technician.trustScore)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/technician">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="font-semibold">Technician Profile</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left: Profile Info */}
          <div className="space-y-6">
            {/* Profile Header */}
            <Card className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success text-success-foreground text-3xl font-bold">
                  {technician.name.charAt(0)}
                </div>
                <div className="flex flex-col gap-2">
                  {technician.verified && (
                    <Badge className="gap-1 bg-success text-success-foreground">
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  {technician.emergencyAvailable && (
                    <Badge className="gap-1 bg-emergency text-emergency-foreground">
                      <Zap className="h-3 w-3" />
                      24/7 Available
                    </Badge>
                  )}
                </div>
              </div>

              <h1 className="mb-2 text-3xl font-bold">{technician.name}</h1>

              <div className="mb-4 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-warning text-warning" />
                  <span className="text-lg font-semibold">{technician.rating || 4.8}</span>
                  <span className="text-sm text-muted-foreground">({technician.completedJobs || 45} jobs)</span>
                </div>
                <Badge variant={trustBadge.variant} className="gap-1">
                  <Shield className="h-3 w-3" />
                  {trustBadge.label}
                </Badge>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <p className="mb-2 text-sm font-semibold text-muted-foreground">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {technician.skills?.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            {/* Details Card */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <Award className="h-5 w-5 text-success" />
                Service Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hourly Rate</span>
                  <span className="font-semibold text-success">${technician.hourlyRate || 75}/hour</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed Jobs</span>
                  <span className="font-semibold">{technician.completedJobs || 45}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Distance</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>1.2 km</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Response Time</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>15 min</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Availability */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <CheckCircle className="h-5 w-5 text-success" />
                Availability
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Working Days</span>
                  <span className="font-medium">{technician.availability?.days.join(", ") || "Mon-Fri"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Working Hours</span>
                  <span className="font-medium">{technician.availability?.hours || "9AM - 6PM"}</span>
                </div>
                {technician.emergencyAvailable && (
                  <Badge className="mt-2 w-full justify-center gap-2 bg-emergency/10 text-emergency">
                    <Zap className="h-4 w-4" />
                    Available for emergencies 24/7
                  </Badge>
                )}
              </div>
            </Card>
          </div>

          {/* Right: Booking Form */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Book This Technician</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Date & Time</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-lg border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">Describe the Service Needed</Label>
                  <Textarea
                    id="service"
                    placeholder="Please describe the issue or service you need help with..."
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    rows={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Include urgency keywords like "emergency" or "urgent" for priority handling
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-4 text-sm">
                  <div className="mb-2 flex items-center gap-2 font-semibold">
                    <AlertCircle className="h-4 w-4" />
                    Estimated Cost
                  </div>
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Hourly Rate</span>
                      <span>${technician.hourlyRate || 75}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Hours</span>
                      <span>1-2 hrs</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold text-foreground">
                      <span>Estimated Total</span>
                      <span className="text-success">
                        ${technician.hourlyRate || 75} - ${(technician.hourlyRate || 75) * 2}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-success hover:bg-success/90"
                  size="lg"
                  onClick={handleBookRequest}
                  disabled={!selectedDate || !serviceDescription || requesting}
                >
                  {requesting ? "Sending request..." : "Send Booking Request"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
