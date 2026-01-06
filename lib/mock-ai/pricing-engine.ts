// Mock AI: Fair Pricing Engine
// TODO: Replace with real ML model

interface PricingFactors {
  serviceType: string
  urgency: "normal" | "priority" | "emergency"
  distance: number
  timeOfDay: number
  marketRates?: { min: number; max: number }
}

export function calculateFairPrice(factors: PricingFactors): number {
  // Base rates by service type
  const baseRates: Record<string, number> = {
    plumber: 80,
    electrician: 90,
    carpenter: 75,
    cleaner: 50,
    locksmith: 100,
    default: 70,
  }

  let price = baseRates[factors.serviceType] || baseRates.default

  // Distance multiplier (per km)
  price += factors.distance * 2

  // Urgency multiplier
  switch (factors.urgency) {
    case "emergency":
      price *= 2.0
      break
    case "priority":
      price *= 1.5
      break
  }

  // Time of day adjustment (night hours = 1.3x)
  if (factors.timeOfDay < 6 || factors.timeOfDay > 22) {
    price *= 1.3
  }

  // Round to nearest 5
  return Math.round(price / 5) * 5
}

export function getPriceRange(basePrice: number): { min: number; max: number } {
  return {
    min: Math.round(basePrice * 0.8),
    max: Math.round(basePrice * 1.2),
  }
}
