"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Wrench, ArrowLeft, Star, Shield, Clock, Zap } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { queryDocuments, where } from "@/lib/firebase/firestore"
import type { Technician } from "@/types"
import { getTrustBadge } from "@/lib/mock-ai/trust-score"

const serviceCategories = [
  "All",
  "Plumber",
  "Electrician",
  "Carpenter",
  "Cleaner",
  "Locksmith",
  "Painter",
  "HVAC",
  "Appliance Repair",
]

export default function TechnicianPage() {
  const { userProfile } = useAuth()
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  useEffect(() => {
    console.log("[v0] Loading technicians from Firestore...")
    loadNearbyTechnicians()
  }, [])

  const loadNearbyTechnicians = async () => {
    try {
      const { data, error } = await queryDocuments("users", [where("role", "==", "technician")])

      if (error) {
        console.error("[v0] Error loading technicians:", error)
        setTechnicians([])
      } else {
        console.log("[v0] Loaded technicians:", data)
        setTechnicians(data as Technician[])
      }
    } catch (err) {
      console.error("[v0] Exception loading technicians:", err)
      setTechnicians([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTechnicians = technicians.filter((tech) => {
    const matchesSearch =
      tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.skills?.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory =
      selectedCategory === "All" ||
      tech.skills?.some((skill) => skill.toLowerCase().includes(selectedCategory.toLowerCase()))
    return matchesSearch && matchesCategory
  })

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
          <div className="flex items-center gap-2 font-bold">
            <Wrench className="h-5 w-5 text-success" />
            <span>Book Technicians</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for plumber, electrician, cleaner..."
              className="pl-10 h-12 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-success" />
            <span>Showing technicians near {userProfile?.location?.address || "your location"}</span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {serviceCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Technicians Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-success border-t-transparent" />
          </div>
        ) : filteredTechnicians.length === 0 ? (
          <div className="py-12 text-center">
            <Wrench className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No technicians found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTechnicians.map((tech) => (
              <TechnicianCard key={tech.id} technician={tech} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function TechnicianCard({ technician }: { technician: Technician }) {
  const trustBadge = getTrustBadge(technician.trustScore)

  return (
    <Link href={`/technician/${technician.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
        {/* Profile Header */}
        <div className="relative bg-gradient-to-br from-success/20 to-success/5 p-6">
          <div className="flex items-start justify-between">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground text-2xl font-bold">
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
                  24/7
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Technician Details */}
        <div className="p-4">
          <h3 className="mb-1 font-semibold text-lg">{technician.name}</h3>

          <div className="mb-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="font-semibold">{technician.rating || 4.8}</span>
              <span className="text-muted-foreground">({technician.completedJobs || 45})</span>
            </div>
            <Badge variant="secondary" className={trustBadge.color}>
              {trustBadge.label}
            </Badge>
          </div>

          {/* Skills */}
          <div className="mb-3 flex flex-wrap gap-1">
            {technician.skills?.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {technician.skills && technician.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{technician.skills.length - 3}
              </Badge>
            )}
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>1.2 km</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-success">
              <Clock className="h-4 w-4" />
              <span>${technician.hourlyRate || 75}/hr</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
