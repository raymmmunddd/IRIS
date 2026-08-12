"use client"

export function CasesSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="h-10 w-32 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200" />
          <div className="h-10 w-32 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200" />
        </div>

        <div className="h-10 w-28 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200" />
      </div>

      {/* Search */}
      <div className="relative h-11 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-5"
          >
            {/* shimmer */}
            <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/45 to-transparent" />

            {/* progress */}
            <div className="-mx-5 -mt-5 mb-5 h-1 rounded-full bg-slate-300" />

            {/* case number */}
            <div className="mb-3 h-3 w-20 rounded bg-slate-300" />

            {/* resident */}
            <div className="mb-2 h-5 w-44 rounded bg-slate-300" />

            {/* date */}
            <div className="mb-4 h-3 w-36 rounded bg-slate-300" />

            {/* description */}
            <div className="space-y-2">
              <div className="h-3 rounded bg-slate-300" />
              <div className="h-3 w-5/6 rounded bg-slate-300" />
            </div>

            {/* tags */}
            <div className="mt-5 flex gap-2">
              <div className="h-6 w-16 rounded-full bg-slate-300" />
              <div className="h-6 w-24 rounded-full bg-slate-300" />
              <div className="h-6 w-20 rounded-full bg-slate-300" />
            </div>

            {/* divider */}
            <div className="my-5 h-px bg-slate-300" />

            {/* footer */}
            <div className="h-3 w-40 rounded bg-slate-300" />
          </div>
        ))}
      </div>
    </div>
  )
}