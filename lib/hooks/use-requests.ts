"use client"

import { useEffect, useState } from "react"
import { subscribeToQuery, where, orderBy } from "@/lib/firebase/firestore"
import type { Request } from "@/types"

export function useUserRequests(userId: string | undefined) {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToQuery(
      "requests",
      [where("createdBy", "==", userId), orderBy("createdAt", "desc")],
      (data) => {
        setRequests(data as Request[])
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [userId])

  return { requests, loading }
}

export function useTechnicianRequests(technicianId: string | undefined) {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!technicianId) {
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToQuery("requests", [where("targetId", "==", technicianId)], (data) => {
      const filteredRequests = (data as Request[])
        .filter((r) => r.type === "service")
        .sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0
          const bTime = b.createdAt?.seconds || 0
          return bTime - aTime
        })
      setRequests(filteredRequests)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [technicianId])

  return { requests, loading }
}

export function useItemOwnerRequests(ownerId: string | undefined) {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ownerId) {
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToQuery("requests", [where("targetId", "==", ownerId)], (data) => {
      const filteredRequests = (data as Request[])
        .filter((r) => r.type === "borrow")
        .sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0
          const bTime = b.createdAt?.seconds || 0
          return bTime - aTime
        })
      setRequests(filteredRequests)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [ownerId])

  return { requests, loading }
}
