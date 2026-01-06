// Mock AI: Trust Score Engine
// TODO: Replace with real ML model

interface TrustFactors {
  ratings: number[]
  completedTransactions: number
  accountAge: number
  verificationStatus: boolean
  reports: number
}

export function calculateTrustScore(factors: TrustFactors): number {
  let score = 50 // Base score

  // Average rating impact (0-5 stars -> 0-30 points)
  if (factors.ratings.length > 0) {
    const avgRating = factors.ratings.reduce((a, b) => a + b, 0) / factors.ratings.length
    score += (avgRating / 5) * 30
  }

  // Completed transactions (capped at 20 points)
  score += Math.min(factors.completedTransactions * 2, 20)

  // Account age (capped at 15 points)
  const ageScore = Math.min(factors.accountAge / 30, 15) // 1 point per 2 days, max 15
  score += ageScore

  // Verification bonus
  if (factors.verificationStatus) {
    score += 10
  }

  // Reports penalty
  score -= factors.reports * 5

  // Normalize to 0-100
  return Math.max(0, Math.min(100, Math.round(score)))
}

export function getTrustBadge(score: number): {
  label: string
  color: string
  variant: "default" | "secondary" | "success" | "warning" | "destructive"
} {
  if (score >= 90) {
    return { label: "Trusted", color: "text-success", variant: "success" }
  } else if (score >= 70) {
    return { label: "Verified", color: "text-primary", variant: "default" }
  } else if (score >= 50) {
    return { label: "New", color: "text-warning", variant: "warning" }
  } else {
    return { label: "Caution", color: "text-destructive", variant: "destructive" }
  }
}
