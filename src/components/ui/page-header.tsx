"use client"

import React from "react"
import { BarChart3 } from "lucide-react"

import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  actionSlot?: React.ReactNode

  variant?: "default" | "banner"

  icon?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  actionSlot,
  variant = "default",
  icon,
}: PageHeaderProps) {
  const isBanner = variant === "banner"

  return (
    <header
      className={cn(
        "relative overflow-hidden border border-[#214b91] shadow-md",
        isBanner
          ? "rounded-2xl bg-gradient-to-r from-[#172f5f] via-[#1b417f] to-[#1e4fa3] px-6 py-7"
          : "mb-3.5 rounded-3xl bg-[var(--sidebar-bg)] shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
      )}
    >
      {/* Ambient Glow */}
      <div className="absolute -top-16 right-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-[#f2b705]/10 blur-2xl" />
      {!isBanner && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_30%)]" />
      )}

      <div
        className={cn(
          "relative z-10 flex flex-col gap-5",
          isBanner
            ? ""
            : "px-6 py-6 lg:flex-row lg:items-center lg:justify-between"
        )}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {!isBanner && (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md">
                {icon ?? <BarChart3 className="h-5 w-5 text-white" />}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                {title}
              </h1>

              {description && (
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-blue-100/90">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {actionSlot && (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {actionSlot}
          </div>
        )}
      </div>
    </header>
  )
}