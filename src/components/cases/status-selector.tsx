"use client"

import { ChevronDown, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CaseStatus } from "@/lib/types"

interface StatusSelectorProps {
  currentStatus: CaseStatus
  onStatusChange: (status: CaseStatus) => void
  isArchived?: boolean
  disabled?: boolean
}

const STATUS_OPTIONS: CaseStatus[] = [
  "Pending",
  "Under Review",
  "Mediation",
  "Resolved",
  "Closed",
]

export function StatusSelector({
  currentStatus,
  onStatusChange,
  isArchived = false,
  disabled = false,
}: StatusSelectorProps) {
  const isReadOnly = disabled || currentStatus === "Closed"
  const isMovingToArchive =
    currentStatus !== "Resolved" && currentStatus !== "Closed"

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-foreground">
        Current Status:
      </label>

      {isArchived && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>This case is archived (read-only)</span>
        </div>
      )}

      {isReadOnly ? (
        <div className="rounded-lg bg-muted px-3 py-2 text-sm text-card-foreground">
          {currentStatus}
        </div>
      ) : (
        <div className="relative">
          <select
            value={currentStatus}
            onChange={(e) => onStatusChange(e.target.value as CaseStatus)}
            disabled={isReadOnly}
            className={cn(
              "w-full appearance-none rounded-lg bg-muted px-3 py-2 pr-8 text-sm text-card-foreground transition-colors",
              "border border-transparent hover:border-border",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              isReadOnly &&
                "cursor-not-allowed opacity-50"
            )}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {!isReadOnly && !isArchived && (
        <p className="text-xs text-muted-foreground">
          {isMovingToArchive &&
          (currentStatus === "Resolved" || currentStatus === "Closed")
            ? "⚠️ Changing to Resolved or Closed will move this case to the archive"
            : "Select a new status to update the case"}
        </p>
      )}
    </div>
  )
}
