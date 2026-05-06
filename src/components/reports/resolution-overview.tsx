"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

type TimePeriod = "today" | "weekly" | "monthly" | "yearly"

type ResolutionOverviewData = Partial<Record<TimePeriod, Record<string, number>>>

const dataByPeriod: ResolutionOverviewData = {
  today: {
    "Submitted": 45,
    "Under Review": 38,
    "Resolved": 89,
    "Closed": 52,
  },
  weekly: {
    "Submitted": 198,
    "Under Review": 156,
    "Resolved": 312,
    "Closed": 198,
  },
  monthly: {
    "Submitted": 312,
    "Under Review": 267,
    "Resolved": 423,
    "Closed": 285,
  },
  yearly: {
    "Submitted": 1250,
    "Under Review": 1089,
    "Resolved": 1875,
    "Closed": 1210,
  },
}

interface ResolutionStatusOverviewProps {
  data?: ResolutionOverviewData
}

export function ResolutionStatusOverview({ data }: ResolutionStatusOverviewProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("monthly")
  const sourceData = data ?? dataByPeriod

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
    const stats = sourceData[timePeriod] ?? dataByPeriod[timePeriod]!
    const total = stats["Submitted"] + stats["Under Review"] + stats["Resolved"] + stats["Closed"]
    const periodLabel = getPeriodLabel()

    return [
      {
        label: "Submitted",
        value: stats["Submitted"].toString(),
        percentage: ((stats["Submitted"] / total) * 100).toFixed(0) + "%",
        periodLabel,
        color: "bg-blue-50 text-blue-600 border-l-4 border-blue-600",
        trending: "up" as const,
        change: 12.5
      },
      {
        label: "Under Review",
        value: stats["Under Review"].toString(),
        percentage: ((stats["Under Review"] / total) * 100).toFixed(0) + "%",
        periodLabel,
        color: "bg-orange-50 text-orange-600 border-l-4 border-orange-600",
        trending: "up" as const,
        change: 8.2
      },
      {
        label: "Resolved",
        value: stats["Resolved"].toString(),
        percentage: ((stats["Resolved"] / total) * 100).toFixed(0) + "%",
        periodLabel,
        color: "bg-emerald-50 text-emerald-600 border-l-4 border-emerald-600",
        trending: "up" as const,
        change: 15.3
      },
      {
        label: "Closed",
        value: stats["Closed"].toString(),
        percentage: ((stats["Closed"] / total) * 100).toFixed(0) + "%",
        periodLabel,
        color: "bg-slate-50 text-slate-600 border-l-4 border-slate-600",
        trending: "down" as const,
        change: 2.1
      },
    ]
  }

  const resolutionStats = getStatsByPeriod()

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md h-full">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-card-foreground">Resolution Overview</h3>
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
