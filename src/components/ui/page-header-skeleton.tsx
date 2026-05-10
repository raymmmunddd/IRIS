"use client"

import { BarChart3 } from "lucide-react"

export function PageHeaderSkeleton() {
  return (
    <header className="relative overflow-hidden border border-[#214b91] shadow-md rounded-3xl bg-[var(--sidebar-bg)]">
      {/* Ambient glow */}
      <div className="absolute -top-16 right-0 h-48 w-48 rounded-full bg-white/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-[#f2b705]/10 blur-2xl animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%)]" />

      <div className="relative z-10 flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
        
        {/* LEFT SKELETON */}
        <div className="flex items-center gap-3">
          
          {/* icon skeleton */}
          <div className="h-11 w-11 rounded-2xl bg-white/10 animate-pulse" />

          <div className="space-y-2">
            {/* title skeleton */}
            <div className="h-5 w-48 rounded bg-white/10 animate-pulse" />

            {/* description skeleton */}
            <div className="h-3 w-80 rounded bg-white/10 animate-pulse" />
          </div>
        </div>

      </div>
    </header>
  )
}