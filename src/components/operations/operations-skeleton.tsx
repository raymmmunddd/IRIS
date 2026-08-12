"use client"

export function OperationsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Tabs */}
      <div className="flex gap-6 pb-3">
        <div className="h-8 w-28 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200" />
        <div className="h-8 w-28 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-5"
          >
            <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/45 to-transparent" />

            <div className="mb-4 h-4 w-28 rounded bg-slate-300" />
            <div className="h-8 w-20 rounded bg-slate-300" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="bg-slate-100/70 p-4">
          <div className="h-4 w-40 rounded bg-slate-300" />
        </div>

        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="relative flex items-center justify-between p-4"
          >
            <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-slate-300" />
              <div className="h-3 w-28 rounded bg-slate-300" />
            </div>

            <div className="h-8 w-24 rounded-xl bg-slate-300" />
          </div>
        ))}
      </div>
    </div>
  )
}