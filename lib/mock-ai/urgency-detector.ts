// Mock AI: Urgency Detection Service
// TODO: Replace with real ML model

import type { UrgencyLevel } from "@/types"

interface UrgencyFactors {
  keywords: string[]
  timeOfDay: number
  userHistory?: any
}

export function detectUrgency(description: string, factors?: UrgencyFactors): UrgencyLevel {
  // Emergency keywords
  const emergencyKeywords = [
    "emergency",
    "urgent",
    "asap",
    "immediately",
    "broken",
    "leak",
    "fire",
    "injury",
    "danger",
    "stuck",
  ]

  // Priority keywords
  const priorityKeywords = ["soon", "today", "quick", "fast", "help", "problem", "issue"]

  const lowerDescription = description.toLowerCase()

  // Check for emergency
  if (emergencyKeywords.some((keyword) => lowerDescription.includes(keyword))) {
    return "emergency"
  }

  // Check for priority
  if (priorityKeywords.some((keyword) => lowerDescription.includes(keyword))) {
    return "priority"
  }

  // Check time of day (night hours = higher urgency)
  if (factors?.timeOfDay && (factors.timeOfDay < 6 || factors.timeOfDay > 22)) {
    return "priority"
  }

  return "normal"
}

export function getUrgencyColor(urgency: UrgencyLevel): string {
  switch (urgency) {
    case "emergency":
      return "text-emergency bg-emergency/10 border-emergency"
    case "priority":
      return "text-warning bg-warning/10 border-warning"
    default:
      return "text-muted-foreground bg-muted border-border"
  }
}

export function getUrgencyLabel(urgency: UrgencyLevel): string {
  switch (urgency) {
    case "emergency":
      return "EMERGENCY"
    case "priority":
      return "Priority"
    default:
      return "Normal"
  }
}
