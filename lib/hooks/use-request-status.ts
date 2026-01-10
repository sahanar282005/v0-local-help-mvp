"use client"

import { useEffect, useState } from "react"
import { subscribeToDocument } from "@/lib/firebase/firestore"
import type { Request } from "@/types"

export function useRequestStatus(requestId: string | undefined) {
  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!requestId) {
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToDocument("requests", requestId, (data) => {
      setRequest(data as Request)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [requestId])

  return { request, loading }
}
