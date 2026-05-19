export const dynamic = 'force-dynamic'
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    try {
      const response = await fetch("/api/notifications")
      const result = await response.json()
      if (result.success) setNotifications(result.data)
    } catch (error) {
      console.error("Failed to load notifications:", error)
    }
  }

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  )

  const recentNotifications = notifications.slice(0, 3)
  const allRead = unreadCount === 0

  const handleMarkSingleRead = async (id: string) => {
    await fetch(`/api/notifications/${encodeURIComponent(id)}`, { method: "PATCH" })
    loadNotifications()
  }

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" })
    loadNotifications()
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
          <Button onClick={handleMarkAllRead} className="rounded-lg" disabled={allRead}>
            Mark all as read
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-emerald-700">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNotifications.map((item) => (
                <button
                  key={item.id}
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
              {notifications.map((item) => (
                <button
                  key={item.id}
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
      </main>
    </div>
  )
}
