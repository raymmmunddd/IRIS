"use client"

import { useEffect, useRef } from "react"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

export type RealtimeTable =
  | "announcements"
  | "audit_logs"
  | "case_chat_messages"
  | "cases"
  | "evidence"
  | "hearings"
  | "notifications"
  | "officers"
  | "settlements"
  | "user_activities"

let client: SupabaseClient | null | undefined
let channelId = 0

function getRealtimeClient() {
  if (client !== undefined) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  client = url && anonKey
    ? createClient(url, anonKey, {
        realtime: { params: { eventsPerSecond: 5 } },
      })
    : null

  return client
}

export function useSupabaseRealtime(tables: RealtimeTable[], onChange: () => void) {
  const callbackRef = useRef(onChange)
  const tableKey = tables.join("|")

  useEffect(() => {
    callbackRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const supabase = getRealtimeClient()
    if (!supabase || !tableKey) return

    let refreshTimer: number | null = null
    let fallbackTimer: number | null = null
    const channel = supabase.channel(`iris-realtime-${tableKey}-${channelId++}`)
    const tableNames = tableKey.split("|").filter(Boolean) as RealtimeTable[]

    const refresh = () => {
      if (refreshTimer) window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => callbackRef.current(), 250)
    }

    tableNames.forEach((table) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh)
    })

    const fallbackMs = tableNames.includes("case_chat_messages") ? 4000 : 12000
    fallbackTimer = window.setInterval(refresh, fallbackMs)

    channel.subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        refresh()
      }
    })

    return () => {
      if (refreshTimer) window.clearTimeout(refreshTimer)
      if (fallbackTimer) window.clearInterval(fallbackTimer)
      supabase.removeChannel(channel)
    }
  }, [tableKey])
}
