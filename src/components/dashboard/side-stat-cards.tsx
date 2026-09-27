"use client"

import { cn } from "@/lib/utils"

type SideStats = { pending: number; underReview: number; officers: number; users: number }

function PulseRow({ title, value, note, status }: { title: string; value: string; note: string; status: "good" | "warn" | "bad" }) {
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

export function SideStatCards({ data }: { data?: SideStats }) {
  return (
    <div className="h-full rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-3">
        <p className="text-sm font-semibold text-slate-700">Operational Pulse</p>
      </div>

      {data ? (
        <>
          <PulseRow title="Pending Queue" value={`${data.pending + data.underReview} cases`} note={`${data.pending} pending · ${data.underReview} under review`} status={data.pending > 0 ? "warn" : "good"} />
          <PulseRow title="Officer Coverage" value={`${data.officers} officers`} note={`${data.users} active accounts`} status={data.officers > 0 ? "good" : "bad"} />
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Operational statistics are unavailable.</p>
      )}
    </div>
  )
}
