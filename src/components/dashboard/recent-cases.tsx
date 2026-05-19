"use client"

import { Clock, AlertTriangle, CheckCircle2, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RecentCaseItem {
  id: string
  title: string
  category: string
  status: "pending" | "under_review" | "resolved"
  created_at: string
}

function getStatusMeta(status: string) {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        icon: <Clock className="h-4 w-4" />,
        color: "text-amber-500",
        bg: "bg-amber-50",
        ring: "ring-amber-200",
      }
    case "under_review":
      return {
        label: "Reviewing",
        icon: <AlertTriangle className="h-4 w-4" />,
        color: "text-blue-500",
        bg: "bg-blue-50",
        ring: "ring-blue-200",
      }
    case "resolved":
      return {
        label: "Resolved",
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        ring: "ring-emerald-200",
      }
    default:
      return {
        label: "Unknown",
        icon: <FileText className="h-4 w-4" />,
        color: "text-slate-500",
        bg: "bg-slate-50",
        ring: "ring-slate-200",
      }
  }
}

export function RecentCases({
  data,
}: {
  data?: RecentCaseItem[]
}) {
  const cases = (data ?? []).slice(0, 5)

  return (
    <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
      
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Recent Cases
        </h2>
        <span className="text-xs text-muted-foreground">
          Live feed
        </span>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cases.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
            No recent cases found.
          </div>
        )}
        {cases.map((c) => {
          const status = getStatusMeta(c.status)

          return (
            <div
              key={c.id}
              className={cn(
                "group relative rounded-xl border bg-background p-3 transition hover:shadow-md hover:-translate-y-[2px]",
                "border-border"
              )}
            >
              {/* top row */}
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full px-2 py-1 text-[10px] font-medium ring-1",
                    status.bg,
                    status.ring,
                    status.color
                  )}
                >
                  {status.icon}
                  {status.label}
                </div>

                <span className="text-[10px] text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* title */}
              <p className="mt-2 text-sm font-medium text-foreground line-clamp-2">
                {c.title}
              </p>

              {/* category */}
              <p className="mt-1 text-xs text-muted-foreground">
                {c.category}
              </p>

              {/* bottom accent line (dashboard feel) */}
              <div className="mt-3 h-1 w-full rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full w-1/2", status.bg)} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
