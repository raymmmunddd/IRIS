"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

type TimePeriod = "today" | "weekly" | "monthly" | "yearly"

const dataByPeriod = {
  today: {
    "Under Review": 45,
    "Mediation": 38,
    "Resolved": 89,
    "Closed": 52,
  },
  weekly: {
    "Under Review": 198,
    "Mediation": 156,
    "Resolved": 312,
    "Closed": 198,
  },
  monthly: {
    "Under Review": 312,
    "Mediation": 267,
    "Resolved": 423,
    "Closed": 285,
  },
  yearly: {
    "Under Review": 1250,
    "Mediation": 1089,
    "Resolved": 1875,
    "Closed": 1210,
  },
}

const statusLines = [
  { key: "Under Review", color: "var(--accent)" },
  { key: "Mediation", color: "var(--secondary)" },
  { key: "Resolved", color: "var(--chart-accent)" },
  { key: "Closed", color: "var(--chart-neutral)" },
]

export function ResolutionPerformanceChart() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly")

  const getPeriodLabel = () => {
    const labels: Record<TimePeriod, string> = {
      "today": "Today",
      "weekly": "This Week",
      "monthly": "This Month",
      "yearly": "This Year"
    }
    return labels[timePeriod]
  }

  const getStatsByPeriod = () => {
    const stats = dataByPeriod[timePeriod]
    const total = stats["Under Review"] + stats["Mediation"] + stats["Resolved"] + stats["Closed"]
    const periodLabel = getPeriodLabel()

    return [
      {
        label: "Under Review",
        value: stats["Under Review"].toString(),
        percentage: ((stats["Under Review"] / total) * 100).toFixed(0) + "%",
        periodLabel,
        color: "bg-[#e0eaff] text-[#1d4ed8] border-l-4 border-[#1d4ed8]",
        trending: "down" as const,
        change: 2.3
      },
      {
        label: "Mediation",
        value: stats["Mediation"].toString(),
        percentage: ((stats["Mediation"] / total) * 100).toFixed(0) + "%",
        periodLabel,
        color: "bg-[#f1e9ff] text-[#6d28d9] border-l-4 border-[#7c3aed]",
        trending: "down" as const,
        change: 1.8
      },
      {
        label: "Resolved",
        value: stats["Resolved"].toString(),
        percentage: ((stats["Resolved"] / total) * 100).toFixed(0) + "%",
        periodLabel,
        color: "bg-[color-mix(in srgb,var(--chart-accent) 12%, transparent)] text-[var(--chart-accent)] border-l-4 border-[var(--chart-accent)]",
        trending: "up" as const,
        change: 5.2
      },
      {
        label: "Closed",
        value: stats["Closed"].toString(),
        percentage: ((stats["Closed"] / total) * 100).toFixed(0) + "%",
        periodLabel,
        color: "bg-[var(--muted)] text-[#1f2937] border-l-4 border-[#94a3b8]",
        trending: "up" as const,
        change: 3.7
      },
    ]
  }

  const resolutionStats = getStatsByPeriod()

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-card-foreground">Case Resolution Status</h3>
        <div className="flex items-center gap-2">
          {(["weekly", "monthly", "yearly"] as TimePeriod[]).map((period) => {
            const labels = {"today": "Today", "weekly": "This Week", "monthly": "This Month", "yearly": "This Year"} as Record<TimePeriod, string>
            return (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors capitalize",
                  timePeriod === period
                    ? "border-[var(--chart-main)] bg-[var(--chart-main)] text-white"
                    : "border-border bg-card text-card-foreground hover:bg-muted"
                )}
              >
                {labels[period]}
              </button>
            )
          })}
        </div>
      </div>
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        {resolutionStats.map((stat) => {
          const isUp = stat.trending === "up"
          return (
            <div key={stat.label} className={cn("rounded-lg p-4 transition-all hover:shadow-md", stat.color)}>
              <p className="mb-2 text-sm font-semibold opacity-80">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm font-semibold opacity-90">{stat.percentage}</p>
                <div className={`flex items-center gap-0.5 text-sm font-semibold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                  {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {stat.change}%
                </div>
              </div>
              <p className="mt-1 text-xs font-medium opacity-70">{stat.periodLabel}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
