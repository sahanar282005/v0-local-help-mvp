// Type definitions for the LocalHelp application
import type { Timestamp } from "firebase/firestore"

export type UserRole = "user" | "technician" | "item_owner" | "admin"

export type RequestStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled"

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

export interface BorrowRequest {
  id: string
  itemId: string
  itemName: string
  borrowerId: string
  borrowerName: string
  ownerId: string
  status: RequestStatus
  urgency: UrgencyLevel
  startDate: Timestamp
  endDate: Timestamp
  depositPaid: boolean
  location: {
    lat: number
    lng: number
    address: string
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface TechnicianRequest {
  id: string
  technicianId: string
  technicianName: string
  userId: string
  userName: string
  service: string
  description: string
  status: RequestStatus
  urgency: UrgencyLevel
  estimatedPrice: number
  location: {
    lat: number
    lng: number
    address: string
  }
  scheduledTime?: Timestamp
  completedTime?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface EmergencyLog {
  id: string
  userId: string
  userName: string
  type: "borrow" | "technician"
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
  requestType: "borrow" | "technician"
  raterId: string
  ratedId: string
  rating: number
  review?: string
  createdAt: Timestamp
}

export interface Transaction {
  id: string
  requestId: string
  requestType: "borrow" | "technician"
  userId: string
  amount: number
  type: "deposit" | "payment" | "refund"
  status: "pending" | "completed" | "failed"
  createdAt: Timestamp
}
