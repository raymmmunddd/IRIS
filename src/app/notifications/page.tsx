"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BellRing,
  Briefcase,
  CalendarDays,
  Clock3,
  Dot,
  FileText,
  Settings,
  Sparkles,
} from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type NotificationItem,
} from "@/lib/notifications"
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [actionError, setActionError] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [updatingAll, setUpdatingAll] = useState(false)

  async function loadNotifications({ background = false, signal }: { background?: boolean; signal?: AbortSignal } = {}) {
    try {
      if (!background) {
        setLoading(true)
        setLoadError("")
      }
      const response = await fetch("/api/notifications", { signal })
      const result = await response.json()
      if (!response.ok || !result.success || !Array.isArray(result.data)) {
        throw new Error(result.message || "Unable to load notifications.")
      }
      setNotifications(result.data)
      setLoadError("")
    } catch (error) {
      if (!signal?.aborted && !background) {
        setLoadError(error instanceof Error ? error.message : "Unable to load notifications.")
      }
    } finally {
      if (!signal?.aborted && !background) setLoading(false)
    }
  }

  useEffect(() => {
    void loadNotifications()
  }, [])

  useRealtimeRefresh((signal) => loadNotifications({ background: true, signal }), {
    topics: ["iris:notifications"],
    fetchOnMount: false,
  })

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  )

  const recentNotifications = notifications.slice(0, 3)
  const allRead = unreadCount === 0

  const handleMarkSingleRead = async (id: string) => {
    setUpdatingId(id)
    setActionError("")
    try {
      const response = await fetch(`/api/notifications/${encodeURIComponent(id)}`, { method: "PATCH" })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to update notification.")
      setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item))
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to update notification.")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleMarkAllRead = async () => {
    setUpdatingAll(true)
    setActionError("")
    try {
      const response = await fetch("/api/notifications", { method: "PATCH" })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to update notifications.")
      setNotifications((current) => current.map((item) => ({ ...item, read: true })))
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to update notifications.")
    } finally {
      setUpdatingAll(false)
    }
  }

  const getCategoryIcon = (category: NotificationItem["category"]) => {
    if (category === "case") return <Briefcase className="h-3.5 w-3.5" />
    if (category === "report") return <FileText className="h-3.5 w-3.5" />
    return <Settings className="h-3.5 w-3.5" />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <DashboardHeader
          title="Notifications"
          description="Track updates and manage your read status"
        />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Unread notifications: {unreadCount}</p>
              <p className="text-xs text-muted-foreground">Tap an item to mark it as read</p>
            </div>
          </div>
          <Button onClick={handleMarkAllRead} className="rounded-lg" disabled={allRead || updatingAll || loading}>
            {updatingAll ? "Updating..." : "Mark all as read"}
          </Button>
        </div>

        {actionError && <p role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{actionError}</p>}
        {loadError && (
          <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <span>{loadError}</span>
            <button type="button" onClick={() => void loadNotifications()} className="font-semibold underline">Retry</button>
          </div>
        )}

        {loading ? (
          <div aria-label="Loading notifications" className="space-y-3">
            {[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : (

        <div className="space-y-6">
          <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-emerald-700">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNotifications.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No recent notifications.</p> : recentNotifications.map((item) => (
                <button
                  key={item.id}
                  disabled={updatingId === item.id || updatingAll}
                  onClick={() => handleMarkSingleRead(item.id)}
                  className="w-full rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-muted"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center rounded-md bg-primary/10 p-1 text-primary">
                        {getCategoryIcon(item.category)}
                      </span>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    </div>
                    {item.read ? (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500">
                        Read
                      </Badge>
                    ) : (
                      <Badge className="h-5 gap-1 bg-emerald-600 px-1.5 text-[10px] text-white">
                        <Sparkles className="h-3 w-3 text-white" />
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.message}</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock3 className="h-3 w-3" />
                    {item.time}
                    <span className="mx-1">•</span>
                    <CalendarDays className="h-3 w-3" />
                    {item.date ?? "Apr 2026"}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-emerald-700">
                <BellRing className="h-4 w-4 text-emerald-600" />
                All Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">You have no notifications.</p> : notifications.map((item) => (
                <button
                  key={item.id}
                  disabled={updatingId === item.id || updatingAll}
                  onClick={() => handleMarkSingleRead(item.id)}
                  className="w-full rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-muted"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center rounded-md bg-primary/10 p-1 text-primary">
                        {getCategoryIcon(item.category)}
                      </span>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    </div>
                    {!item.read ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <Dot className="h-5 w-5 text-emerald-600" />
                        Unread
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">
                        Read
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.message}</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock3 className="h-3 w-3" />
                    {item.time}
                    <span className="mx-1">•</span>
                    <CalendarDays className="h-3 w-3" />
                    {item.date ?? "Apr 2026"}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
        )}
      </main>
    </div>
  )
}
