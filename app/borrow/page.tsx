"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Package, ArrowLeft, Star, Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { queryDocuments, where } from "@/lib/firebase/firestore"
import type { Item } from "@/types"
import { getTrustBadge } from "@/lib/mock-ai/trust-score"

export default function BorrowPage() {
  const { userProfile } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadNearbyItems()
  }, [])

  const loadNearbyItems = async () => {
    // Mock: Load available items
    // In production, use geolocation queries
    const { data } = await queryDocuments("items", [where("available", "==", true)])
    setItems(data as Item[])
    setLoading(false)
  }

  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
            <Package className="h-5 w-5 text-primary" />
            <span>Borrow Items</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for tools, equipment, or items..."
              className="pl-10 h-12 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Showing items near {userProfile?.location?.address || "your location"}</span>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No items found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or check back later.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Add Item Button (for item owners) */}
        {userProfile?.role === "item_owner" && (
          <div className="mt-12 text-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/borrow/add">
                <Package className="h-5 w-5" />
                List Your Item
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

function ItemCard({ item }: { item: Item }) {
  const trustBadge = getTrustBadge(item.trustScore)

  return (
    <Link href={`/borrow/${item.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
        {/* Item Image */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={item.image || `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(item.name)}`}
            alt={item.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-110"
          />
          <Badge className="absolute right-2 top-2 bg-card text-card-foreground">
            <Shield className="mr-1 h-3 w-3" />
            {trustBadge.label}
          </Badge>
        </div>

        {/* Item Details */}
        <div className="p-4">
          <h3 className="mb-1 font-semibold text-lg truncate">{item.name}</h3>
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{item.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>0.5 km</span>
            </div>
            <div className="font-semibold text-primary">${item.depositAmount} deposit</div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>by {item.ownerName}</span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span>4.8</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
