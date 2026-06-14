"use client"

import { Clock, Timer, Users, Activity, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

function PulseRow({ title, value, note, status }: any) {
  return (
    <div
      className="
        relative flex flex-col justify-start
        rounded-2xl
        border border-border/50
        bg-card
        p-4 sm:p-6
        shadow-sm
        transition-all duration-300
        hover:-translate-y-[1px] hover:shadow-lg
      "
    >
      {/* TOP RIGHT STATUS DOT */}
      <div
        className={cn(
          "absolute right-4 top-4 h-2.5 w-2.5 rounded-full",
          status === "good" && "bg-emerald-500",
          status === "warn" && "bg-amber-500",
          status === "bad" && "bg-red-500"
        )}
      />

      <div>
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
        <p className="text-[11px] text-slate-400">{note}</p>
      </div>
    </div>
  )
}

export function SideStatCards({ data }: any) {
  return (
    <div className="h-full rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-3">
        <p className="text-sm font-semibold text-slate-700">Operational Pulse</p>
      </div>

      <PulseRow
        title="Pending Queue"
        value="152 cases"
        note="89 under review"
        status="warn"
      />

      <PulseRow
        title="Response Time"
        value="4.2 hrs"
        note="SLA target: 6 hrs"
        status="good"
      />

      <PulseRow
        title="Officer Load"
        value="12.4 avg"
        note="35 active officers"
        status="warn"
      />
    </div>
  )
}