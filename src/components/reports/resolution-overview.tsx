"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

type TimePeriod = "weekly" | "monthly" | "yearly"
type ResolutionOverviewData = Partial<Record<TimePeriod, Record<string, number>>>

interface ResolutionStatusOverviewProps {
  data?: ResolutionOverviewData
}

const statusStyles: Record<string, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700 border-blue-700",
  MEDIATION: "bg-purple-50 text-purple-700 border-purple-700",
  CONCILIATION: "bg-indigo-50 text-indigo-700 border-indigo-700",
  ARBITRATION: "bg-orange-50 text-orange-700 border-orange-700",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-700",
  REPUDIATION: "bg-amber-50 text-amber-700 border-amber-700",
  DISMISSED: "bg-red-50 text-red-700 border-red-700",
  WITHDRAWN: "bg-slate-50 text-slate-700 border-slate-700",
}

const periodLabels: Record<TimePeriod, string> = {
  weekly: "This Week",
  monthly: "This Month",
  yearly: "This Year",
}

export function ResolutionStatusOverview({ data }: ResolutionStatusOverviewProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("monthly")
  const stats = data?.[timePeriod]
  const statuses = ["SCHEDULED", "MEDIATION", "CONCILIATION", "ARBITRATION", "RESOLVED", "REPUDIATION", "DISMISSED", "WITHDRAWN"]
  const total = statuses.reduce((sum, status) => sum + (stats?.[status] ?? 0), 0)

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-card-foreground">Resolution Overview</h3>
        <div className="flex items-center gap-2">
          {(["weekly", "monthly", "yearly"] as TimePeriod[]).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setTimePeriod(period)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                timePeriod === period
                  ? "border-[var(--chart-main)] bg-[var(--chart-main)] text-white"
                  : "border-border bg-card text-card-foreground hover:bg-muted",
              )}
            >
              {periodLabels[period]}
            </button>
          ))}
        </div>
      </div>
      {!stats ? (
        <div className="flex h-[calc(100%-3rem)] items-center justify-center text-sm text-muted-foreground">
          No resolution data available.
        </div>
      ) : (
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statuses.map((status) => {
            const value = stats[status] ?? 0
            const percentage = total ? Math.round((value / total) * 100) : 0
            return (
              <div key={status} className={cn("rounded-lg border-l-4 p-4", statusStyles[status])}>
                <p className="mb-2 text-sm font-semibold opacity-80">{status.replaceAll("_", " ")}</p>
                <p className="text-3xl font-bold">{value.toLocaleString()}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-semibold opacity-90">{percentage}%</p>
                  <p className="text-xs font-medium opacity-70">{periodLabels[timePeriod]}</p>
                </div>
              </div>
            )
          })}
        </div>
        </div>
      )}
    </div>
  )
}
