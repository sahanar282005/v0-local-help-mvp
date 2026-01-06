"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, ArrowLeft, Wrench, Package, Zap, MapPin, Phone, Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { createDocument, queryDocuments, where } from "@/lib/firebase/firestore"
import { useToast } from "@/hooks/use-toast"

type EmergencyType = "technician" | "item"

export default function EmergencyPage() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [type, setType] = useState<EmergencyType>("technician")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleEmergencyRequest = async () => {
    if (!userProfile || !description) return

    setLoading(true)

    // Log emergency
    const { id, error: logError } = await createDocument("emergency_logs", {
      userId: userProfile.id,
      userName: userProfile.name,
      type,
      description,
      location: userProfile.location || {
        lat: 0,
        lng: 0,
        address: "Location not set",
      },
      status: "pending",
    })

    if (logError) {
      toast({
        title: "Emergency request failed",
        description: logError,
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    // Find available emergency responders
    let availableHelpers: any[] = []

    if (type === "technician") {
      const { data } = await queryDocuments("users", [
        where("role", "==", "technician"),
        where("emergencyAvailable", "==", true),
      ])
      availableHelpers = data
    } else {
      const { data } = await queryDocuments("items", [where("available", "==", true)])
      availableHelpers = data
    }

    // Create emergency request
    if (type === "technician" && availableHelpers.length > 0) {
      const closestTech = availableHelpers[0] // In production, sort by distance
      await createDocument("technician_requests", {
        technicianId: closestTech.id,
        technicianName: closestTech.name,
        userId: userProfile.id,
        userName: userProfile.name,
        service: "Emergency Service",
        description,
        status: "pending",
        urgency: "emergency",
        estimatedPrice: 0,
        location: userProfile.location,
        emergencyLogId: id,
      })
    } else if (type === "item" && availableHelpers.length > 0) {
      const closestItem = availableHelpers[0]
      await createDocument("borrow_requests", {
        itemId: closestItem.id,
        itemName: closestItem.name,
        borrowerId: userProfile.id,
        borrowerName: userProfile.name,
        ownerId: closestItem.ownerId,
        status: "pending",
        urgency: "emergency",
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000), // +1 day
        depositPaid: false,
        location: closestItem.location,
        emergencyLogId: id,
        notes: description,
      })
    }

    toast({
      title: "Emergency request sent!",
      description: `${availableHelpers.length} nearby ${type === "technician" ? "technicians" : "items"} notified. Help is on the way.`,
    })

    router.push("/emergency/status")
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-emergency/5">
      {/* Header */}
      <header className="border-b border-emergency/20 bg-emergency/10 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="h-5 w-5 text-emergency emergency-pulse" />
            <span className="text-emergency">Emergency Help</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Warning Banner */}
        <Card className="mb-6 border-emergency/50 bg-emergency/10 p-6 text-emergency">
          <div className="flex gap-4">
            <Zap className="h-6 w-6 flex-shrink-0 emergency-pulse" />
            <div>
              <h3 className="mb-2 font-semibold">Emergency Mode Active</h3>
              <p className="text-sm">
                Your request will be prioritized and sent to all available helpers nearby. Response time: 5-10 minutes.
              </p>
              <p className="mt-2 text-sm font-semibold">
                For life-threatening emergencies, please call 911 immediately.
              </p>
            </div>
          </div>
        </Card>

        {/* Emergency Form */}
        <Card className="p-6">
          <h2 className="mb-6 text-2xl font-bold">What do you need urgently?</h2>

          <div className="space-y-6">
            {/* Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Emergency Type</Label>
              <RadioGroup value={type} onValueChange={(value) => setType(value as EmergencyType)}>
                <div className="flex items-center space-x-2 rounded-lg border-2 border-muted p-4 transition-colors hover:border-emergency has-[:checked]:border-emergency has-[:checked]:bg-emergency/5">
                  <RadioGroupItem value="technician" id="tech" />
                  <Label htmlFor="tech" className="flex flex-1 cursor-pointer items-center gap-3 text-base font-normal">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Emergency Technician</p>
                      <p className="text-sm text-muted-foreground">Urgent repairs or services needed now</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border-2 border-muted p-4 transition-colors hover:border-emergency has-[:checked]:border-emergency has-[:checked]:bg-emergency/5">
                  <RadioGroupItem value="item" id="item" />
                  <Label htmlFor="item" className="flex flex-1 cursor-pointer items-center gap-3 text-base font-normal">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Emergency Item</p>
                      <p className="text-sm text-muted-foreground">Need a tool or equipment immediately</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                Describe Your Emergency
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what happened and what help you need urgently..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="border-2"
                required
              />
              <p className="text-sm text-muted-foreground">Be specific to get the fastest and most accurate help.</p>
            </div>

            {/* Location Info */}
            <div className="rounded-lg bg-muted p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4" />
                Your Location
              </div>
              <p className="text-sm text-muted-foreground">
                {userProfile?.location?.address || "Location will be shared with responders"}
              </p>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleEmergencyRequest}
              disabled={!description || loading}
              size="lg"
              className="w-full gap-2 bg-emergency text-emergency-foreground hover:bg-emergency/90 text-lg h-14"
            >
              {loading ? (
                "Sending emergency request..."
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Send Emergency Request
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Safety Tips */}
        <Card className="mt-6 p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Shield className="h-5 w-5 text-primary" />
            Safety First
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span>•</span>
              <span>Only use this for urgent situations requiring immediate help</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Verify the identity of anyone who responds to your request</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>For medical emergencies or fires, call emergency services immediately</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Share your location with a trusted contact when receiving help</span>
            </li>
          </ul>
        </Card>

        {/* Emergency Contact */}
        <div className="mt-6 text-center">
          <p className="mb-2 text-sm text-muted-foreground">Life-threatening emergency?</p>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 border-2 border-destructive text-destructive bg-transparent"
          >
            <Phone className="h-5 w-5" />
            Call 911
          </Button>
        </div>
      </main>
    </div>
  )
}
