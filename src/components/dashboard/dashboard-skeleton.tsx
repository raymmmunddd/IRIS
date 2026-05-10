"use client"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">

      {/* STAT ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="relative h-28 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_1.4s_infinite]" />
          </div>
        ))}
      </div>

      {/* CHART ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 relative h-72 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.6s_infinite]" />
        </div>

        <div className="relative h-72 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.6s_infinite]" />
        </div>

      </div>

      {/* INSIGHTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="relative h-32 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent animate-[shimmer_1.5s_infinite]" />
          </div>
        ))}

      </div>

    </div>
  )
}