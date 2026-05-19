"use client"
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { Activity, BadgeCheck, Clock3, Info, ShieldCheck } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuthUser } from "@/lib/auth"

type ActivityLogItem = {
  id: string
  label: string
  detail: string
  category: string
  status: "Verified" | "Info"
  timestamp: string
  timeLabel: string
}

export default function ProfileActivityPage() {
  const authUser = getAuthUser()
  const [activityItems, setActivityItems] = useState<ActivityLogItem[]>([])
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActivity() {
      if (!authUser?.email) {
        setLoading(false)
        return
      }

      try {
        const [settingsResponse, activityResponse] = await Promise.all([
          fetch(`/api/settings?email=${encodeURIComponent(authUser.email)}`),
          fetch(`/api/profile/activity?email=${encodeURIComponent(authUser.email)}`),
        ])

        const settingsResult = await settingsResponse.json()
        const activityResult = await activityResponse.json()

        if (settingsResult.success && settingsResult.data) {
          setTwoFactorEnabled(settingsResult.data.twoFactorEnabled)
        }
        if (activityResult.success && activityResult.data) {
          setActivityItems(activityResult.data)
        }
      } catch (error) {
        console.error("Failed to load activity:", error)
      } finally {
        setLoading(false)
      }
    }

    loadActivity()
  }, [authUser?.email])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex h-screen shrink-0">
        <DashboardSidebar />
      </div>

      <main className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
        <DashboardHeader
          title="Profile Activity Logs"
          description="Review profile-related actions and recent security events"
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-sm font-semibold">Verification</p>
                <p className="text-xs text-muted-foreground">Account is verified</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-sm font-semibold">Current Session</p>
                <p className="text-xs text-muted-foreground">Desktop browser active</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-sm font-semibold">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">
                  {twoFactorEnabled ? "Configured" : "Not configured"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityItems.length === 0 && (
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-sm font-semibold text-foreground">No activity yet</p>
                  <p className="text-xs text-muted-foreground">Recent account and case actions will appear here.</p>
                </div>
              )}

              <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-2">
                {activityItems.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border bg-background p-3">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      {item.status === "Verified" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                          <BadgeCheck className="h-4 w-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-700">
                          <Info className="h-4 w-4" />
                          Info
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock3 className="h-3 w-3" />
                      {item.timeLabel}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </main>
    </div>
  )
}
