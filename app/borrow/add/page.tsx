"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { createDocument } from "@/lib/firebase/firestore"
import { useToast } from "@/hooks/use-toast"

const categories = ["Tools", "Electronics", "Garden", "Kitchen", "Sports", "Camping", "Other"]

export default function AddItemPage() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    depositAmount: "",
    image: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile) return

    setLoading(true)

    const { id, error } = await createDocument("items", {
      ...formData,
      depositAmount: Number(formData.depositAmount),
      ownerId: userProfile.id,
      ownerName: userProfile.name,
      available: true,
      location: userProfile.location || {
        lat: 0,
        lng: 0,
        address: "Location not set",
      },
      trustScore: userProfile.trustScore,
    })

    if (error) {
      toast({
        title: "Failed to add item",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Item listed!",
        description: "Your item is now available for borrowing.",
      })
      router.push("/borrow")
    }

    setLoading(false)
  }

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
          <div className="flex items-center gap-2 font-bold">
            <Package className="h-5 w-5 text-primary" />
            <span>List Your Item</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                placeholder="e.g., Power Drill"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your item, its condition, and any special instructions..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit">Deposit Amount ($)</Label>
              <Input
                id="deposit"
                type="number"
                min="0"
                placeholder="50"
                value={formData.depositAmount}
                onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">Refundable security deposit</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input
                id="image"
                type="url"
                placeholder="https://..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Listing item..." : "List Item"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  )
}
