"use client"

import { useEffect, useMemo, useRef } from "react"
import { subscribeToIrisRefresh, type IrisRefreshTopic } from "@/lib/iris-realtime"

type UseRealtimeRefreshOptions = {
  enabled?: boolean
  fetchOnMount?: boolean
  refreshKey?: string | number | null
  topics: IrisRefreshTopic[]
  debounceMs?: number
}

export function useRealtimeRefresh(
  callback: (signal: AbortSignal) => void | Promise<void>,
  { enabled = true, fetchOnMount = true, refreshKey, topics, debounceMs = 120 }: UseRealtimeRefreshOptions,
) {
  const callbackRef = useRef(callback)
  const refreshRef = useRef<(() => void) | null>(null)
  const initialRefreshKey = useRef(refreshKey)
  const topicKey = [...new Set(topics)].sort().join("|")
  const stableTopics = useMemo(
    () => topicKey.split("|").filter(Boolean) as IrisRefreshTopic[],
    [topicKey],
  )

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (refreshKey === initialRefreshKey.current) return
    initialRefreshKey.current = refreshKey
    refreshRef.current?.()
  }, [refreshKey])

  useEffect(() => {
    if (!enabled) return

    let mounted = true
    let inFlight = false
    let pendingRefresh = false
    let controller: AbortController | null = null
    let debounceTimer: number | null = null

    const refresh = () => {
      if (!mounted) return
      if (document.visibilityState === "hidden") {
        pendingRefresh = true
        return
      }
      if (inFlight) {
        pendingRefresh = true
        return
      }

      pendingRefresh = false
      inFlight = true
      controller = new AbortController()
      void Promise.resolve()
        .then(() => callbackRef.current(controller!.signal))
        .catch(() => undefined)
        .finally(() => {
          if (!mounted) return
          inFlight = false
          controller = null
          if (pendingRefresh) scheduleRefresh()
        })
    }

    const scheduleRefresh = () => {
      if (!mounted) return
      if (debounceTimer !== null) window.clearTimeout(debounceTimer)
      debounceTimer = window.setTimeout(() => {
        debounceTimer = null
        refresh()
      }, debounceMs)
    }

    refreshRef.current = scheduleRefresh

    if (fetchOnMount) refresh()

    const unsubscribe = stableTopics.map((topic) => subscribeToIrisRefresh(topic, (signal) => {
      if (signal === "change" || signal === "reconnected" || signal === "connection-error") {
        scheduleRefresh()
      }
    }))

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") scheduleRefresh()
    }
    document.addEventListener("visibilitychange", refreshWhenVisible)
    window.addEventListener("focus", refreshWhenVisible)

    return () => {
      mounted = false
      if (refreshRef.current === scheduleRefresh) refreshRef.current = null
      if (debounceTimer !== null) window.clearTimeout(debounceTimer)
      document.removeEventListener("visibilitychange", refreshWhenVisible)
      window.removeEventListener("focus", refreshWhenVisible)
      controller?.abort()
      unsubscribe.forEach((removeListener) => removeListener())
    }
  }, [enabled, fetchOnMount, stableTopics, debounceMs])
}
