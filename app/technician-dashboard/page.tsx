"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useTechnicianRequests } from "@/lib/hooks/use-requests"
import { updateDocument, queryDocuments, where } from "@/lib/firebase/firestore"
import {
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Navigation,
  Wrench,
  Package,
  Plus,
  Edit2,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Item } from "@/types"

export default function TechnicianDashboard() {
  const { userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(false)
  const { requests, loading: requestsLoading } = useTechnicianRequests(userProfile?.id)
  const [myItems, setMyItems] = useState<Item[]>([])
  const [itemsLoading, setItemsLoading] = useState(true)
  const [skills, setSkills] = useState<string[]>([])
  const [editingSkills, setEditingSkills] = useState(false)
  const [newSkill, setNewSkill] = useState("")

  useEffect(() => {
    if (!authLoading && userProfile?.role !== "technician") {
      router.push("/")
    }
  }, [userProfile, authLoading, router])

  useEffect(() => {
    const fetchMyItems = async () => {
      if (!userProfile?.id) return
      setItemsLoading(true)
      const { data } = await queryDocuments("items", [where("ownerId", "==", userProfile.id)])
      setMyItems(data as Item[])
      setItemsLoading(false)
    }

    fetchMyItems()
  }, [userProfile?.id])

  useEffect(() => {
    if (userProfile && (userProfile as any).skills) {
      setSkills((userProfile as any).skills || [])
    }
  }, [userProfile])

  if (authLoading || requestsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!userProfile || userProfile.role !== "technician") {
    return null
  }

  const pendingRequests = requests.filter((r) => r.status === "created" || r.status === "pending")
  const acceptedRequests = requests.filter((r) => r.status === "accepted" || r.status === "in_progress")
  const completedRequests = requests.filter((r) => r.status === "completed")
  const emergencyRequests = pendingRequests.filter((r) => r.urgency === "emergency")

  const totalEarnings = completedRequests.reduce((sum, r) => sum + (r.price || 0), 0)
  const availableItems = myItems.filter((item) => item.available).length

  const handleToggleAvailability = async () => {
    const newStatus = !isOnline
    setIsOnline(newStatus)

    if (userProfile?.id) {
      await updateDocument("users", userProfile.id, {
        emergencyAvailable: newStatus,
      })
    }
  }

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !userProfile?.id) return

    const updatedSkills = [...skills, newSkill.trim()]
    setSkills(updatedSkills)
    setNewSkill("")

    await updateDocument("users", userProfile.id, {
      skills: updatedSkills,
    })
  }

  const handleRemoveSkill = async (skillToRemove: string) => {
    if (!userProfile?.id) return

    const updatedSkills = skills.filter((s) => s !== skillToRemove)
    setSkills(updatedSkills)

    await updateDocument("users", userProfile.id, {
      skills: updatedSkills,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/technician-dashboard" className="flex items-center gap-2 font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success text-white">
              <Navigation className="h-4 w-4" />
            </div>
            <span>Technician Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/history">History</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile">Profile</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Switch to User</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Welcome, {userProfile.name}!</h1>
            <p className="text-muted-foreground">Manage your jobs, services, and items</p>
          </div>

          {/* Availability Toggle */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch id="availability" checked={isOnline} onCheckedChange={handleToggleAvailability} />
                <Label htmlFor="availability" className="cursor-pointer">
                  {isOnline ? (
                    <div className="flex items-center gap-2 text-success">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      Online
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                      Offline
                    </div>
                  )}
                </Label>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <StatsCard
            icon={<Clock className="h-5 w-5" />}
            label="Pending Requests"
            value={pendingRequests.length}
            color="text-warning"
          />
          <StatsCard
            icon={<AlertCircle className="h-5 w-5" />}
            label="Emergency"
            value={emergencyRequests.length}
            color="text-emergency"
          />
          <StatsCard
            icon={<DollarSign className="h-5 w-5" />}
            label="Total Earnings"
            value={`$${totalEarnings}`}
            color="text-success"
          />
          <StatsCard
            icon={<Package className="h-5 w-5" />}
            label="My Items"
            value={availableItems}
            color="text-primary"
          />
        </div>

        {/* Tabs for Services, Items, and Requests */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">Requests ({pendingRequests.length})</TabsTrigger>
            <TabsTrigger value="services">My Services</TabsTrigger>
            <TabsTrigger value="items">My Items ({myItems.length})</TabsTrigger>
          </TabsList>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {/* Emergency Requests Section */}
            {emergencyRequests.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-emergency emergency-pulse" />
                  <h2 className="text-2xl font-bold text-emergency">Emergency Requests</h2>
                </div>
                <div className="grid gap-4">
                  {emergencyRequests.map((request) => (
                    <RequestCard key={request.id} request={request} isEmergency />
                  ))}
                </div>
              </div>
            )}

            {/* Pending Requests */}
            <div>
              <h2 className="mb-4 text-2xl font-bold">Incoming Requests</h2>
              {pendingRequests.filter((r) => r.urgency !== "emergency").length === 0 ? (
                <Card className="p-8 text-center">
                  <CheckCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No pending requests at the moment</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {pendingRequests
                    .filter((r) => r.urgency !== "emergency")
                    .map((request) => (
                      <RequestCard key={request.id} request={request} />
                    ))}
                </div>
              )}
            </div>

            {/* Active Jobs */}
            {acceptedRequests.length > 0 && (
              <div>
                <h2 className="mb-4 text-2xl font-bold">Active Jobs</h2>
                <div className="grid gap-4">
                  {acceptedRequests.map((request) => (
                    <RequestCard key={request.id} request={request} isActive />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Wrench className="h-6 w-6 text-success" />
                    Services I Offer
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your skills and expertise to attract more clients
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSkills(!editingSkills)}
                  className="gap-2 bg-transparent"
                >
                  <Edit2 className="h-4 w-4" />
                  {editingSkills ? "Done" : "Edit"}
                </Button>
              </div>

              {editingSkills && (
                <div className="mb-6 flex gap-2">
                  <Input
                    placeholder="e.g., Plumbing, Electrical, Carpentry"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddSkill()
                      }
                    }}
                  />
                  <Button onClick={handleAddSkill} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              )}

              {skills.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No services added yet</p>
                  <Button onClick={() => setEditingSkills(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Service
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-base py-2 px-4 gap-2">
                      <Wrench className="h-4 w-4" />
                      {skill}
                      {editingSkills && (
                        <button onClick={() => handleRemoveSkill(skill)} className="ml-1 hover:text-destructive">
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items" className="space-y-6">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Package className="h-6 w-6 text-primary" />
                    Items I Lend
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Earn extra by lending your tools and equipment</p>
                </div>
                <Button asChild className="gap-2">
                  <Link href="/borrow/add">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Link>
                </Button>
              </div>

              {itemsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : myItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No items listed yet</p>
                  <Button asChild className="gap-2">
                    <Link href="/borrow/add">
                      <Plus className="h-4 w-4" />
                      List Your First Item
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {myItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function StatsCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`${color}`}>{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  )
}

function RequestCard({
  request,
  isEmergency = false,
  isActive = false,
}: {
  request: any
  isEmergency?: boolean
  isActive?: boolean
}) {
  const router = useRouter()
  const [accepting, setAccepting] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  const handleAccept = async () => {
    setAccepting(true)
    await updateDocument("requests", request.id, {
      status: "accepted",
      acceptedAt: new Date(),
    })
    setAccepting(false)
  }

  const handleReject = async () => {
    setRejecting(true)
    await updateDocument("requests", request.id, {
      status: "rejected",
      rejectedReason: "Technician unavailable",
    })
    setRejecting(false)
  }

  const handleNavigate = () => {
    router.push(`/technician-dashboard/job/${request.id}`)
  }

  return (
    <Card
      className={`p-6 transition-all hover:shadow-lg ${isEmergency ? "border-2 border-emergency bg-emergency/5" : ""}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-lg font-semibold">{request.description}</h3>
            {isEmergency && (
              <Badge variant="destructive" className="emergency-pulse">
                EMERGENCY
              </Badge>
            )}
            {request.urgency === "priority" && <Badge variant="secondary">Priority</Badge>}
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{request.location?.address || "Location not specified"}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>Estimated: ${request.price || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{new Date(request.createdAt?.seconds * 1000).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isActive ? (
            <Button onClick={handleNavigate} className="gap-2">
              <Navigation className="h-4 w-4" />
              Navigate
            </Button>
          ) : (
            <>
              <Button onClick={handleAccept} disabled={accepting} className="gap-2 bg-success hover:bg-success/90">
                <CheckCircle className="h-4 w-4" />
                Accept
              </Button>
              <Button onClick={handleReject} disabled={rejecting} variant="outline" className="gap-2 bg-transparent">
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

function ItemCard({ item }: { item: Item }) {
  const router = useRouter()

  return (
    <Card
      className="p-4 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => router.push(`/borrow/${item.id}`)}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
            {item.image ? (
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="h-full w-full object-cover rounded-lg"
              />
            ) : (
              <Package className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold truncate">{item.name}</h3>
            {item.available ? (
              <Badge variant="default" className="bg-success">
                Available
              </Badge>
            ) : (
              <Badge variant="secondary">Borrowed</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-primary">${item.depositAmount} deposit</span>
            <Badge variant="outline">{item.category}</Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}
