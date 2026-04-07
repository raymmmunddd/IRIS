"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  ChevronDown,
  Clock3,
  FileText,
  LogOut,
  Sparkles,
  Settings,
  User,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getRecentNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from "@/lib/notifications"
import { getUserProfile } from "@/lib/profile"
import { logout } from "@/lib/auth"

interface DashboardHeaderProps {
  title: string
  description?: string
  actionSlot?: React.ReactNode
}

export function DashboardHeader({ title, description, actionSlot }: DashboardHeaderProps) {
  const router = useRouter()
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([])
  const [displayName, setDisplayName] = useState("Admin")
  const [displayEmail, setDisplayEmail] = useState("admin@iris.local")

  useEffect(() => {
    const profile = getUserProfile()
    const recent = getRecentNotifications(3)
    setDisplayName(profile.fullName)
    setDisplayEmail(profile.email)
    setRecentNotifications(recent)
  }, [])

  const unreadCount = recentNotifications.filter((item) => !item.read).length

  const handleReadNotification = (id: number) => {
    markNotificationAsRead(id)
    setRecentNotifications(getRecentNotifications(3))
  }

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead()
    setRecentNotifications(getRecentNotifications(3))
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="flex items-center justify-between pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actionSlot}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted"
              aria-label="Open notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[360px] rounded-xl border border-[var(--iris-border)] bg-[var(--iris-surface)]/95 p-0 shadow-[0_20px_50px_rgba(15,23,42,0.18)] backdrop-blur"
          >
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                <p className="text-xs text-muted-foreground">Recent activity only</p>
              </div>
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Mark all read
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto px-2 py-2">
              <DropdownMenuLabel className="px-2 pb-1 pt-1 text-xs uppercase tracking-wide text-muted-foreground">
                Recent
              </DropdownMenuLabel>
              {recentNotifications.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onSelect={() => handleReadNotification(item.id)}
                  className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5"
                >
                  <span className="mt-0.5 rounded-md bg-primary/10 p-1.5 text-primary">
                    <Clock3 className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      {!item.read && (
                        <Badge className="h-5 gap-1 bg-emerald-600 px-1.5 text-[10px] text-white">
                          <Sparkles className="h-3 w-3 text-white" />
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.message}</p>
                    <p className="text-[11px] text-muted-foreground">{item.time}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>

            <div className="border-t border-border px-2 py-2">
              <DropdownMenuItem asChild className="cursor-pointer justify-center rounded-lg py-2 text-sm font-medium">
                <Link href="/notifications">View all notifications</Link>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="group flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted"
              aria-label="Open admin profile menu"
            >
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight text-card-foreground">{displayName}</p>
                <p className="text-[11px] leading-tight text-muted-foreground">System Administrator</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-72 rounded-xl border border-[var(--iris-border)] bg-[var(--iris-surface)]/95 p-0 shadow-[0_20px_50px_rgba(15,23,42,0.18)] backdrop-blur"
          >
            <div className="border-b border-border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{displayEmail}</p>
                </div>
              </div>
            </div>
            <div className="p-2">
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-2 py-2">
                <Link href="/profile">
                  <User className="h-4 w-4" />
                  Profile Overview
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-2 py-2">
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-2 py-2">
                <Link href="/profile/activity">
                  <FileText className="h-4 w-4" />
                  Activity Logs
                </Link>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <div className="p-2">
              <DropdownMenuItem
                onSelect={handleLogout}
                className="cursor-pointer rounded-xl border border-red-200 bg-gradient-to-r from-red-500 to-rose-500 px-3 py-2.5 font-medium text-white shadow-[0_10px_20px_rgba(239,68,68,0.25)] transition-all hover:from-red-600 hover:to-rose-600 focus:bg-red-600 focus:text-white"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/20">
                  <LogOut className="h-4 w-4 text-white" />
                </span>
                <span className="font-semibold tracking-wide">Logout</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
