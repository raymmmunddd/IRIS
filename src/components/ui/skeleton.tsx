"use client"

import { cn } from "@/lib/utils"

export function Skeleton({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-200/60 dark:bg-slate-800/40",
        className
      )}
    />
  )
}