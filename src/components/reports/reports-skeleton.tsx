"use client"

export function ReportsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-5"
          >
            <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/45 to-transparent" />

            <div className="mb-4 h-3 w-24 rounded bg-slate-300" />
            <div className="mb-3 h-8 w-20 rounded bg-slate-300" />
            <div className="h-3 w-32 rounded bg-slate-300" />
          </div>
        ))}
      </div>

      {/* Monthly Trend */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-6">
        <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/45 to-transparent" />

        <div className="mb-6 flex items-center justify-between">
          <div className="h-5 w-48 rounded bg-slate-300" />
          <div className="h-9 w-36 rounded-xl bg-slate-300" />
        </div>

        <div className="flex h-[320px] items-end justify-between gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-1 flex-col items-center justify-end gap-3"
            >
              <div
                className="w-full rounded-t-xl bg-slate-300"
                style={{
                  height: `${80 + ((i * 23) % 160)}px`,
                }}
              />
              <div className="h-3 w-8 rounded bg-slate-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Two Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-5"
          >
            <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/45 to-transparent" />

            <div className="mb-5 h-5 w-40 rounded bg-slate-300" />

            <div className="flex h-[280px] items-center justify-center">
              <div className="h-44 w-44 rounded-full border-[18px] border-slate-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-5"
          >
            <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/45 to-transparent" />

            <div className="mb-5 h-5 w-44 rounded bg-slate-300" />

            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <div
                  key={j}
                  className="flex items-center gap-3"
                >
                  <div className="h-3 w-20 rounded bg-slate-300" />
                  <div className="h-3 flex-1 rounded bg-slate-300" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}