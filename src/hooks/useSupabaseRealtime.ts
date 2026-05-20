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
    const channel = supabase.channel(`iris-realtime-${tableKey}`)
    const tableNames = tableKey.split("|").filter(Boolean) as RealtimeTable[]

    const refresh = () => {
      if (refreshTimer) window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => callbackRef.current(), 250)
    }

    tableNames.forEach((table) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh)
    })

    channel.subscribe()

    return () => {
      if (refreshTimer) window.clearTimeout(refreshTimer)
      supabase.removeChannel(channel)
    }
  }, [tableKey])
}
