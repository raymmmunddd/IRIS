"use client"

import { Clock, Timer, Users, Activity, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

function PulseRow({ title, value, note, status }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-none">
      <div>
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
        <p className="text-[11px] text-slate-400">{note}</p>
      </div>

      <div
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          status === "good" && "bg-emerald-500",
          status === "warn" && "bg-amber-500",
          status === "bad" && "bg-red-500"
        )}
      />
    </div>
  )
}

export function SideStatCards({ data }: any) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-slate-500" />
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