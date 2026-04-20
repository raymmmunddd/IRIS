"use client"

import { useEffect, useState } from "react"
import { Activity, BadgeCheck, Clock3, Info, ShieldCheck } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatActivityTime, getActivityLogs, type ActivityLogItem } from "@/lib/activityLogs"
import { getProfileSecurity } from "@/lib/profile"

export default function ProfileActivityPage() {
  const [activityItems, setActivityItems] = useState<ActivityLogItem[]>([])
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  useEffect(() => {
    const security = getProfileSecurity()
    setTwoFactorEnabled(security.twoFactorEnabled)
    setActivityItems(getActivityLogs())
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <DashboardHeader
          title="Profile Activity Logs"
          description="Review profile-related actions and recent security events"
        />

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
                      {formatActivityTime(item.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
