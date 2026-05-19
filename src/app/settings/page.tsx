export const dynamic = 'force-dynamic'
"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, Clock3, KeyRound, Save, ShieldCheck } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAuthUser } from "@/lib/auth"

function parseStoredDate(value: string): Date | null {
  if (!value || value === "Never") return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date
}

function formatRelativePasswordUpdate(value: string): string {
  const updatedAt = parseStoredDate(value)
  if (!updatedAt) return "No password update recorded"

  const now = new Date()
  const diffMs = now.getTime() - updatedAt.getTime()
  const diffMinutes = Math.floor(diffMs / (60 * 1000))

  if (diffMinutes < 1) return "Updated just now"
  if (diffMinutes < 60) return `Updated ${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Updated ${diffHours} hour${diffHours === 1 ? "" : "s"} ago`

  const dateText = updatedAt.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const timeText = updatedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })

  return `Updated on ${dateText} at ${timeText}`
}

function getPasswordStatus(value: string): {
  label: string
  detail: string
  tone: "healthy" | "attention"
} {
  const updatedAt = parseStoredDate(value)
  if (!updatedAt) {
    return {
      label: "Needs attention",
      detail: "No password update history found. Set a fresh password to secure this account.",
      tone: "attention",
    }
  }

  const now = new Date()
  const diffDays = Math.floor((now.getTime() - updatedAt.getTime()) / (24 * 60 * 60 * 1000))

  if (diffDays <= 30) {
    return {
      label: "Healthy",
      detail: "Password was updated recently. Continue rotating it regularly.",
      tone: "healthy",
    }
  }

  return {
    label: "Rotate soon",
    detail: "Password age is over 30 days. Rotate it to reduce security risk.",
    tone: "attention",
  }
}

export default function SettingsPage() {
  const authUser = getAuthUser()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [lastUpdated, setLastUpdated] = useState("Never")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [, forceTimeRefresh] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSecurity() {
      if (!authUser?.email) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/settings?email=${encodeURIComponent(authUser.email)}`)
        const result = await response.json()
        if (result.success && result.data) {
          setLastUpdated(result.data.passwordLastUpdated)
          setTwoFactorEnabled(result.data.twoFactorEnabled)
        }
      } catch (error) {
        console.error("Failed to load security settings:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSecurity()
  }, [authUser?.email])

  useEffect(() => {
    const interval = window.setInterval(() => {
      forceTimeRefresh((value) => value + 1)
    }, 60 * 1000)

    return () => window.clearInterval(interval)
  }, [])

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage("Please complete all password fields.")
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage("New password should be at least 8 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New password and confirm password do not match.")
      return
    }

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "password",
          email: authUser?.email,
          currentPassword,
          newPassword,
        }),
      })
      const result = await response.json()

      if (!result.success || !result.data) {
        throw new Error(result.message)
      }

      setLastUpdated(result.data.passwordLastUpdated)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordMessage("Password updated successfully.")
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : "Failed to update password.")
    }
  }

  const handleToggleTwoFactor = async () => {
    const next = !twoFactorEnabled
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "twoFactor",
          email: authUser?.email,
          enabled: next,
        }),
      })
      const result = await response.json()
      if (result.success && result.data) {
        setTwoFactorEnabled(result.data.twoFactorEnabled)
        setLastUpdated(result.data.passwordLastUpdated)
      }
    } catch (error) {
      console.error("Failed to update two-factor settings:", error)
    }
  }

  const passwordStatus = getPasswordStatus(lastUpdated)
  const lastUpdatedLabel = formatRelativePasswordUpdate(lastUpdated)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex h-screen shrink-0">
        <DashboardSidebar />
      </div>

      <main className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
        <DashboardHeader
          title="Account Settings"
          description="Manage your password and security preferences"
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4 text-primary" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  className="focus-visible:ring-0 focus-visible:ring-transparent"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  className="focus-visible:ring-0 focus-visible:ring-transparent"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="focus-visible:ring-0 focus-visible:ring-transparent"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>

              <div className="rounded-lg border border-border bg-background/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Password Update Status
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                  <Clock3 className="h-4 w-4 text-primary" />
                  {lastUpdatedLabel}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handlePasswordChange} className="gap-2 rounded-lg px-5">
                  <Save className="h-4 w-4" />
                  Update Password
                </Button>
              </div>

              {passwordMessage && (
                <p className="text-sm text-foreground">{passwordMessage}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Security Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">
                      {twoFactorEnabled ? "Configured and active" : "Not configured"}
                    </p>
                  </div>
                  <Button
                    variant={twoFactorEnabled ? "outline" : "default"}
                    className="h-8 min-w-28 rounded-md px-3 text-xs"
                    onClick={handleToggleTwoFactor}
                  >
                    {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-sm font-medium">Active Session</p>
                <p className="text-xs text-muted-foreground">Current browser session is secured</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center gap-2">
                  {passwordStatus.tone === "healthy" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                  <p className="text-sm font-medium">Password Status: {passwordStatus.label}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{passwordStatus.detail}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </main>
    </div>
  )
}
