"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Users, Package, Wrench, AlertCircle, TrendingUp, Clock, CheckCircle, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { queryDocuments } from "@/lib/firebase/firestore"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalTechnicians: 0,
    totalRequests: 0,
    emergencyRequests: 0,
    avgResponseTime: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile?.role !== "admin") {
      router.push("/")
    } else {
      loadStats()
    }
  }, [userProfile])

  const loadStats = async () => {
    // Load aggregated stats
    const { data: users } = await queryDocuments("users", [])
    const { data: items } = await queryDocuments("items", [])
    const { data: borrowRequests } = await queryDocuments("borrow_requests", [])
    const { data: techRequests } = await queryDocuments("technician_requests", [])
    const { data: emergencies } = await queryDocuments("emergency_logs", [])

    const technicians = users.filter((u: any) => u.role === "technician")

    setStats({
      totalUsers: users.length,
      totalItems: items.length,
      totalTechnicians: technicians.length,
      totalRequests: borrowRequests.length + techRequests.length,
      emergencyRequests: emergencies.length,
      avgResponseTime: 8, // Mock: 8 minutes
    })

    setLoading(false)
  }

  if (loading || userProfile?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
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
          <div className="flex items-center gap-2 font-bold">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Admin Dashboard</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Platform Overview</h1>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-3 lg:grid-cols-6">
          <StatCard icon={<Users className="h-6 w-6" />} label="Total Users" value={stats.totalUsers} />
          <StatCard icon={<Package className="h-6 w-6" />} label="Items Listed" value={stats.totalItems} />
          <StatCard icon={<Wrench className="h-6 w-6" />} label="Technicians" value={stats.totalTechnicians} />
          <StatCard
            icon={<CheckCircle className="h-6 w-6" />}
            label="Total Requests"
            value={stats.totalRequests}
            trend="+12%"
          />
          <StatCard
            icon={<AlertCircle className="h-6 w-6" />}
            label="Emergencies"
            value={stats.emergencyRequests}
            color="text-emergency"
          />
          <StatCard
            icon={<Clock className="h-6 w-6" />}
            label="Avg Response"
            value={`${stats.avgResponseTime}m`}
            trend="-2m"
          />
        </div>

        {/* Charts and Data */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="emergencies">Emergencies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-4 font-semibold">Request Distribution</h3>
                <div className="space-y-4">
                  <ProgressBar label="Borrow Requests" value={65} color="bg-primary" />
                  <ProgressBar label="Technician Bookings" value={28} color="bg-success" />
                  <ProgressBar label="Emergency Help" value={7} color="bg-emergency" />
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 font-semibold">Platform Health</h3>
                <div className="space-y-3">
                  <HealthMetric label="User Satisfaction" value={94} status="excellent" />
                  <HealthMetric label="Response Rate" value={87} status="good" />
                  <HealthMetric label="Trust Score Avg" value={78} status="good" />
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">User Management</h3>
              <p className="text-sm text-muted-foreground">User management features coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Request Analytics</h3>
              <p className="text-sm text-muted-foreground">Request analytics coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="emergencies">
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Emergency Logs</h3>
              <p className="text-sm text-muted-foreground">Emergency log viewer coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  trend,
  color = "text-foreground",
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: string
  color?: string
}) {
  return (
    <Card className="p-6">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-muted-foreground">{icon}</div>
        {trend && (
          <Badge variant="outline" className="gap-1 text-xs">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </Badge>
        )}
      </div>
      <div className={`mb-1 text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Card>
  )
}

function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function HealthMetric({
  label,
  value,
  status,
}: {
  label: string
  value: number
  status: "excellent" | "good" | "warning"
}) {
  const colors = {
    excellent: "text-success",
    good: "text-primary",
    warning: "text-warning",
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <span className={`font-semibold ${colors[status]}`}>{value}%</span>
    </div>
  )
}
