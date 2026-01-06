"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, MapPin, Clock, CheckCircle, AlertCircle, Phone, MessageSquare, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function EmergencyStatusPage() {
  const { userProfile } = useAuth()
  const [elapsedTime, setElapsedTime] = useState(0)
  const [status, setStatus] = useState<"searching" | "found" | "en-route">("searching")

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    // Simulate status updates
    setTimeout(() => setStatus("found"), 3000)
    setTimeout(() => setStatus("en-route"), 6000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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
            <span className="text-emergency">Emergency Status</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Status Card */}
        <Card className="mb-6 overflow-hidden border-2 border-emergency/50 p-0">
          <div className="bg-emergency/10 p-6">
            <div className="mb-4 flex items-center justify-between">
              <Badge className="gap-2 bg-emergency text-emergency-foreground px-4 py-2 text-sm emergency-pulse">
                <Zap className="h-4 w-4" />
                EMERGENCY ACTIVE
              </Badge>
              <div className="flex items-center gap-2 text-lg font-mono font-semibold">
                <Clock className="h-5 w-5" />
                {formatTime(elapsedTime)}
              </div>
            </div>

            <h2 className="mb-2 text-2xl font-bold">
              {status === "searching" && "Finding available help..."}
              {status === "found" && "Help found!"}
              {status === "en-route" && "Help is on the way"}
            </h2>

            <p className="text-sm text-muted-foreground">
              {status === "searching" && "Searching for the closest available responders in your area"}
              {status === "found" && "A verified helper has been notified and is preparing to assist you"}
              {status === "en-route" && "Your helper is traveling to your location now"}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="p-6">
            <div className="space-y-4">
              <StatusStep
                icon={<AlertCircle className="h-5 w-5" />}
                label="Request Received"
                time="Just now"
                completed={true}
              />
              <StatusStep
                icon={<CheckCircle className="h-5 w-5" />}
                label="Helper Found"
                time={status !== "searching" ? `${Math.max(3 - elapsedTime, 0)}s ago` : "Searching..."}
                completed={status !== "searching"}
                active={status === "searching"}
              />
              <StatusStep
                icon={<MapPin className="h-5 w-5" />}
                label="En Route"
                time={status === "en-route" ? "Now" : "Waiting..."}
                completed={status === "en-route"}
                active={status === "found"}
              />
              <StatusStep
                icon={<CheckCircle className="h-5 w-5" />}
                label="Help Arrived"
                time="Estimated 8 min"
                completed={false}
                active={false}
              />
            </div>
          </div>
        </Card>

        {/* Helper Info (shown after found) */}
        {status !== "searching" && (
          <Card className="mb-6 p-6">
            <h3 className="mb-4 font-semibold">Your Helper</h3>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground text-2xl font-bold">
                M
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Mike Johnson</h4>
                <p className="text-sm text-muted-foreground">Verified Emergency Responder</p>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <Badge className="bg-success">4.9 ★</Badge>
                  <span className="text-muted-foreground">128 successful emergencies</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button className="flex-1 gap-2 bg-transparent" variant="outline">
                <Phone className="h-4 w-4" />
                Call Helper
              </Button>
              <Button className="flex-1 gap-2 bg-transparent" variant="outline">
                <MessageSquare className="h-4 w-4" />
                Message
              </Button>
            </div>
          </Card>
        )}

        {/* Location Map Placeholder */}
        <Card className="mb-6 overflow-hidden">
          <div className="relative aspect-video bg-muted">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="mx-auto mb-2 h-12 w-12 text-emergency emergency-pulse" />
                <p className="font-semibold">Tracking location...</p>
                <p className="text-sm text-muted-foreground">
                  {status === "en-route" ? "1.2 km away • 8 min" : "Waiting for helper"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Cancel Button */}
        <div className="text-center">
          <Button variant="ghost" className="text-destructive" asChild>
            <Link href="/">Cancel Emergency Request</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}

function StatusStep({
  icon,
  label,
  time,
  completed,
  active,
}: {
  icon: React.ReactNode
  label: string
  time: string
  completed: boolean
  active?: boolean
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          completed
            ? "bg-success text-success-foreground"
            : active
              ? "animate-pulse bg-warning text-warning-foreground"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className={`font-medium ${completed ? "text-foreground" : "text-muted-foreground"}`}>{label}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}
