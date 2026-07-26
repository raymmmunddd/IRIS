"use client"

import {
  FileText,
  CheckCircle2,
  Clock3,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

type CardState = "normal" | "warning" | "critical" | "positive"

interface InsightCardProps {
  title: string
  value: string
  description: string
  state: CardState
  icon: React.ReactNode
}

function InsightTile({
  title,
  value,
  description,
  state,
  icon,
}: InsightCardProps) {
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
          <p className="text-sm font-semibold tracking-wide text-slate-600">
            {title}
          </p>

          <div
            className={cn(
              "inline-flex rounded-xl px-3 py-1.5 text-lg font-bold",
              styles.badge
            )}
          >
            {value}
          </div>

          <p className="text-sm leading-relaxed text-slate-600">
            {description}
          </p>
        </div>

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

interface ReportStatsProps {
  data?: {
    totalCases: number
    resolutionRate: number
    activeOfficers: number
  }
}

export function ReportStats({ data }: ReportStatsProps) {
  const cards: InsightCardProps[] = [
    {
      title: "Total Cases",
      value: (data?.totalCases ?? 1247).toLocaleString(),
      description: "Incident reports recorded in the system.",
      state: "normal",
      icon: <FileText className="h-6 w-6" />,
    },

    {
      title: "Resolution Rate",
      value: `${data?.resolutionRate ?? 88}%`,
      description: "Cases successfully resolved.",
      state: "positive",
      icon: <CheckCircle2 className="h-6 w-6" />,
    },

    {
      title: "Average Response Time",
      value: "2.4 Hours",
      description: "Average officer response to new incidents.",
      state: "warning",
      icon: <Clock3 className="h-6 w-6" />,
    },

    {
      title: "Active Officers",
      value: `${data?.activeOfficers ?? 8}`,
      description: "Personnel currently available for deployment.",
      state: "critical",
      icon: <Users className="h-6 w-6" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <InsightTile key={card.title} {...card} />
      ))}
    </div>
  )
}