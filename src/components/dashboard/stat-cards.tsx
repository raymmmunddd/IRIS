"use client"

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  TrendingUp,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface InsightCard {
  title: string
  value: string
  description: string
  state: "normal" | "warning" | "critical" | "positive"
  icon: React.ReactNode
}

function InsightTile({
  title,
  value,
  description,
  state,
  icon,
}: InsightCard) {
  const styles = {
    normal: {
      card: "border-slate-200 bg-white",
      icon: "bg-slate-100 text-slate-700",
      badge: "bg-slate-100 text-slate-700",
    },

    positive: {
      card: "border-emerald-200 bg-emerald-50/40",
      icon: "bg-emerald-100 text-emerald-700",
      badge: "bg-emerald-100 text-emerald-700",
    },

    warning: {
      card: "border-amber-200 bg-amber-50/50",
      icon: "bg-amber-100 text-amber-700",
      badge: "bg-amber-100 text-amber-700",
    },

    critical: {
      card: "border-red-200 bg-red-50/50",
      icon: "bg-red-100 text-red-700",
      badge: "bg-red-100 text-red-700",
    },
  }[state]

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        styles.card
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          {/* TITLE */}
          <p className="text-sm font-semibold tracking-wide text-slate-600">
            {title}
          </p>

          {/* VALUE */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "inline-flex rounded-xl px-3 py-1.5 text-lg font-bold",
                styles.badge
              )}
            >
              {value}
            </div>
          </div>

          {/* DESCRIPTION */}
          <p className="text-sm leading-relaxed text-slate-600">
            {description}
          </p>
        </div>

        {/* ICON */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            styles.icon
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

export function StatCards() {
  const insights: InsightCard[] = [
  {
    title: "Cases Being Handled",
    value: "438 Cases",
    description: "Cases currently under review.",
    state: "warning",
    icon: <Clock3 className="h-6 w-6" />,
  },

  {
    title: "Cases Resolved Faster",
    value: "+18%",
    description: "Cases finished this week.",
    state: "positive",
    icon: <TrendingUp className="h-6 w-6" />,
  },

  {
    title: "New Incident Reports",
    value: "Normal",
    description: "New reports remain steady.",
    state: "normal",
    icon: <Activity className="h-6 w-6" />,
  },

  {
    title: "Urgent Cases",
    value: "76 Cases",
    description: "Needs immediate attention.",
    state: "critical",
    icon: <AlertTriangle className="h-6 w-6" />,
  },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {insights.map((item) => (
        <InsightTile key={item.title} {...item} />
      ))}
    </div>
  )
}