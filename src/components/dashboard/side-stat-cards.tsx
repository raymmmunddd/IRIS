"use client"

import { Activity } from "lucide-react"
import { cn } from "@/lib/utils"

type PulseRowProps = {
  title: string
  value: string
  note: string
  status: "good" | "warn" | "bad"
}

export type DashboardSideStats = {
  pending: number
  underReview: number
  officers: number
  users: number
}

function PulseRow({ title, value, note, status }: PulseRowProps) {
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

export function SideStatCards({ data }: { data?: DashboardSideStats }) {
  const stats = data ?? { pending: 0, underReview: 0, officers: 0, users: 0 }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-slate-500" />
        <p className="text-sm font-semibold text-slate-700">Operational Pulse</p>
      </div>

      <PulseRow
        title="Pending Queue"
        value={`${stats.pending} cases`}
        note={`${stats.underReview} under review`}
        status="warn"
      />

      <PulseRow
        title="Officer Coverage"
        value={`${stats.officers} officers`}
        note="Active operations team"
        status="good"
      />

      <PulseRow
        title="Registered Users"
        value={`${stats.users} users`}
        note="Active resident accounts"
        status="warn"
      />
    </div>
  )
}
