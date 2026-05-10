"use client"

import { FileText, Briefcase, CheckCircle2, AlertTriangle, Activity, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface InsightCard {
  label: string
  value: string
  context: string
  state: "normal" | "warning" | "critical" | "positive"
}

function InsightTile({ label, value, context, state }: InsightCard) {
  const stateStyle = {
    normal: "bg-slate-50 border-slate-200",
    positive: "bg-emerald-50 border-emerald-200",
    warning: "bg-amber-50 border-amber-200",
    critical: "bg-red-50 border-red-200",
  }[state]

  const iconColor = {
    normal: "text-slate-500",
    positive: "text-emerald-600",
    warning: "text-amber-600",
    critical: "text-red-600",
  }[state]

  return (
    <div className={cn("rounded-2xl border p-4 relative overflow-hidden", stateStyle)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          <p className="text-[11px] text-slate-500 mt-1">{context}</p>
        </div>

        <div className={cn("p-2 rounded-xl bg-white/60", iconColor)}>
          <Activity className="w-4 h-4" />
        </div>
      </div>

      {/* subtle activity bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
        <div className="h-full w-2/3 bg-current opacity-20" />
      </div>
    </div>
  )
}

export function StatCards({ data }: any) {
  const insights: InsightCard[] = [
    {
      label: "Case Load Pressure",
      value: "High",
      context: "438 active cases under processing flow",
      state: "warning",
    },
    {
      label: "Resolution Momentum",
      value: "+18%",
      context: "Faster closures compared to last week",
      state: "positive",
    },
    {
      label: "Incident Intake",
      value: "Stable",
      context: "No abnormal spike in reports",
      state: "normal",
    },
    {
      label: "Critical Queue",
      value: "76",
      context: "Requires immediate attention",
      state: "critical",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {insights.map((i) => (
        <InsightTile key={i.label} {...i} />
      ))}
    </div>
  )
}