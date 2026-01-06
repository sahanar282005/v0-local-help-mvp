"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Package, Wrench, AlertCircle, MapPin, Star, Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function LandingPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (user) {
    return <HomePage />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="flex items-center gap-3 rounded-2xl bg-card px-6 py-3 shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <MapPin className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold">LocalHelp</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight md:text-7xl">Help, Tools & Technicians</h1>
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-primary md:text-6xl">
            Instantly Near You
          </h2>

          {/* Subheading */}
          <p className="mx-auto mb-12 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Your hyperlocal support network. Borrow what you need, book verified technicians, or get emergency help —
            all from your neighborhood.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-14 gap-2 px-8 text-lg shadow-lg">
              <Link href="/auth/signup">
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg bg-transparent">
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              <span>Verified Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-warning" />
              <span>Trusted Community</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Hyperlocal Network</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<Package className="h-8 w-8" />}
            title="Borrow Items"
            description="Need tools or equipment? Borrow from neighbors nearby with trusted profiles and fair deposits."
            color="bg-primary/10 text-primary"
          />
          <FeatureCard
            icon={<Wrench className="h-8 w-8" />}
            title="Book Technicians"
            description="Get verified local professionals for repairs, maintenance, and services at transparent rates."
            color="bg-success/10 text-success"
          />
          <FeatureCard
            icon={<AlertCircle className="h-8 w-8" />}
            title="Emergency Help"
            description="Urgent situation? Get priority matching with available helpers in your area right away."
            color="bg-emergency/10 text-emergency"
          />
        </div>
      </div>
    </div>
  )
}

function HomePage() {
  const { userProfile } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </div>
            <span>LocalHelp</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/history">History</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile">Profile</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="mb-2 text-3xl font-bold text-balance">Welcome back, {userProfile?.name || "there"}!</h1>
          <p className="text-muted-foreground">What do you need help with today?</p>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <ActionCard
            href="/borrow"
            icon={<Package className="h-12 w-12" />}
            title="Borrow an Item"
            description="Find tools, equipment, or items near you"
            color="bg-primary"
            hoverColor="hover:bg-primary/90"
          />
          <ActionCard
            href="/technician"
            icon={<Wrench className="h-12 w-12" />}
            title="Get a Technician"
            description="Book verified local professionals"
            color="bg-success"
            hoverColor="hover:bg-success/90"
          />
          <ActionCard
            href="/emergency"
            icon={<AlertCircle className="h-12 w-12 emergency-pulse" />}
            title="Emergency Help"
            description="Urgent assistance available now"
            color="bg-emergency"
            hoverColor="hover:bg-emergency/90"
          />
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid gap-6 md:grid-cols-4">
          <StatCard label="Trust Score" value={userProfile?.trustScore || 75} suffix="/100" />
          <StatCard label="Nearby Items" value="24" suffix="+" />
          <StatCard label="Technicians" value="12" suffix="" />
          <StatCard label="Avg Response" value="8" suffix="min" />
        </div>
      </main>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  return (
    <Card className="p-6 transition-all hover:shadow-lg">
      <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${color}`}>{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  )
}

function ActionCard({
  href,
  icon,
  title,
  description,
  color,
  hoverColor,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  color: string
  hoverColor: string
}) {
  return (
    <Link href={href}>
      <Card
        className={`group relative overflow-hidden ${color} p-8 text-white transition-all ${hoverColor} cursor-pointer hover:shadow-2xl hover:scale-105`}
      >
        <div className="relative z-10">
          <div className="mb-4">{icon}</div>
          <h3 className="mb-2 text-2xl font-bold text-balance">{title}</h3>
          <p className="text-sm text-white/90">{description}</p>
          <div className="mt-6 flex items-center gap-2 font-semibold">
            Get Started <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
      </Card>
    </Link>
  )
}

function StatCard({ label, value, suffix }: { label: string; value: string | number; suffix: string }) {
  return (
    <Card className="p-6 text-center">
      <p className="mb-2 text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold">
        {value}
        <span className="text-lg text-muted-foreground">{suffix}</span>
      </p>
    </Card>
  )
}
