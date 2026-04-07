"use client"

import { Activity, BadgeCheck, Clock3, ShieldCheck } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const activityItems = [
  {
    id: 1,
    label: "Profile name updated",
    detail: "You changed your display name.",
    time: "Today, 9:14 AM",
  },
  {
    id: 2,
    label: "Password changed",
    detail: "Your account password was updated successfully.",
    time: "Yesterday, 8:02 PM",
  },
  {
    id: 3,
    label: "Admin login",
    detail: "Signed in from trusted desktop device.",
    time: "Yesterday, 7:46 PM",
  },
]

export default function ProfileActivityPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <DashboardHeader
          title="Profile Activity Logs"
          description="Review profile-related actions and recent security events"
        />

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
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
            </CardContent>
          </Card>

          <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activityItems.map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-background p-3">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                      <BadgeCheck className="h-4 w-4" />
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock3 className="h-3 w-3" />
                    {item.time}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
