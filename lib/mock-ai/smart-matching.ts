// Mock AI: Smart Matching Engine
// TODO: Replace with real ML model

import type { Item, Technician } from "@/types"

interface MatchingFactors {
  distance: number
  trustScore: number
  availability: boolean
  rating?: number
  urgency: "normal" | "priority" | "emergency"
  userPreferences?: any
}

export function matchItems(userLocation: { lat: number; lng: number }, items: Item[], urgency: string): Item[] {
  // TODO: Implement geospatial queries and ML-based ranking
  // Current: Simple rule-based sorting

  return items
    .map((item) => ({
      ...item,
      score: calculateMatchScore({
        distance: calculateDistance(userLocation, item.location),
        trustScore: item.trustScore,
        availability: item.available,
        urgency: urgency as any,
      }),
    }))
    .sort((a: any, b: any) => b.score - a.score)
}

export function matchTechnicians(
  userLocation: { lat: number; lng: number },
  technicians: Technician[],
  urgency: string,
): Technician[] {
  // TODO: Implement skill-based matching and availability prediction
  // Current: Simple rule-based sorting

  return technicians
    .filter((tech) => tech.verified && (urgency === "emergency" ? tech.emergencyAvailable : true))
    .map((tech) => ({
      ...tech,
      score: calculateMatchScore({
        distance: calculateDistance(userLocation, tech.location || { lat: 0, lng: 0 }),
        trustScore: tech.trustScore,
        availability: tech.emergencyAvailable || true,
        rating: tech.rating,
        urgency: urgency as any,
      }),
    }))
    .sort((a: any, b: any) => b.score - a.score)
}

function calculateMatchScore(factors: MatchingFactors): number {
  let score = 100

  // Distance penalty (0-30 points)
  score -= Math.min(factors.distance * 2, 30)

  // Trust score bonus (0-25 points)
  score += (factors.trustScore / 100) * 25

  // Availability bonus
  if (factors.availability) {
    score += 15
  }

  // Rating bonus
  if (factors.rating) {
    score += (factors.rating / 5) * 10
  }

  // Urgency multiplier
  if (factors.urgency === "emergency") {
    score *= 1.5
  } else if (factors.urgency === "priority") {
    score *= 1.2
  }

  return Math.max(0, Math.min(150, score))
}

function calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
  // TODO: Use actual geospatial calculations
  // Current: Mock distance
  return Math.random() * 5 // 0-5 km
}

export function predictResponseTime(
  distance: number,
  urgency: string,
  timeOfDay: number,
): { min: number; max: number } {
  // TODO: Implement ML-based ETA prediction
  // Current: Rule-based estimation

  let baseTime = distance * 3 // 3 min per km

  // Time of day adjustment
  if (timeOfDay >= 7 && timeOfDay <= 9) {
    baseTime *= 1.5 // Rush hour
  } else if (timeOfDay >= 17 && timeOfDay <= 19) {
    baseTime *= 1.3
  }

  // Urgency adjustment
  if (urgency === "emergency") {
    baseTime *= 0.7
  }

  return {
    min: Math.ceil(baseTime * 0.8),
    max: Math.ceil(baseTime * 1.2),
  }
}
