// Type definitions for the LocalHelp application
import type { Timestamp } from "firebase/firestore"

export type UserRole = "user" | "technician" | "admin"

export type RequestStatus = "created" | "pending" | "accepted" | "in_progress" | "completed" | "rejected" | "cancelled"

export type RequestType = "service" | "borrow"

export type UrgencyLevel = "normal" | "priority" | "emergency"

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: UserRole
  avatar?: string
  location?: {
    lat: number
    lng: number
    address: string
  }
  trustScore: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Technician extends User {
  role: "technician"
  skills: string[]
  verified: boolean
  emergencyAvailable: boolean
  rating: number
  completedJobs: number
  hourlyRate: number
  availability: {
    days: string[]
    hours: string
  }
}

export interface Item {
  id: string
  ownerId: string
  ownerName: string
  name: string
  description: string
  category: string
  image: string
  available: boolean
  depositAmount: number
  location: {
    lat: number
    lng: number
    address: string
  }
  trustScore: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Request {
  id: string
  type: RequestType
  createdBy: string
  createdByName: string
  targetId: string
  targetName?: string
  status: RequestStatus
  urgency: UrgencyLevel
  price: number
  description: string
  location: {
    lat: number
    lng: number
    address: string
  }
  itemId?: string
  itemName?: string
  service?: string
  startDate?: Timestamp
  endDate?: Timestamp
  scheduledTime?: Timestamp
  completedTime?: Timestamp
  acceptedAt?: Timestamp
  rejectedReason?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface EmergencyLog {
  id: string
  userId: string
  userName: string
  type: RequestType
  description: string
  location: {
    lat: number
    lng: number
    address: string
  }
  resolvedBy?: string
  responseTime?: number
  status: RequestStatus
  createdAt: Timestamp
  resolvedAt?: Timestamp
}

export interface Rating {
  id: string
  requestId: string
  requestType: RequestType
  raterId: string
  ratedId: string
  rating: number
  review?: string
  createdAt: Timestamp
}

export interface Transaction {
  id: string
  requestId: string
  requestType: RequestType
  userId: string
  amount: number
  type: "deposit" | "payment" | "refund"
  status: "pending" | "completed" | "failed"
  createdAt: Timestamp
}

export interface TechnicianStatus {
  userId: string
  online: boolean
  lastSeen: Timestamp
  currentLocation?: {
    lat: number
    lng: number
  }
}

export interface Earnings {
  technicianId: string
  month: string
  totalEarnings: number
  completedJobs: number
  cancelledJobs: number
  averageRating: number
}
