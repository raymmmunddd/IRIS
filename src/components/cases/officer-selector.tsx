"use client"

import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAvailableOfficers } from "@/lib/mock-officers"

interface OfficerSelectorProps {
  currentOfficer: string
  onOfficerChange: (officer: string) => void
  disabled?: boolean
}

export function OfficerSelector({
  currentOfficer,
  onOfficerChange,
  disabled = false,
}: OfficerSelectorProps) {
  const officers = getAvailableOfficers()

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-foreground">
        Assigned Officer:
      </label>

      <div className="relative">
        <select
          value={currentOfficer || "Unassigned"}
          onChange={(e) => onOfficerChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "w-full appearance-none rounded-lg bg-muted px-3 py-2 pr-8 text-sm text-card-foreground transition-colors",
            "border border-transparent hover:border-border",
            "focus:outline-none focus:ring-2 focus:ring-primary/20",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {officers.map((officer) => (
            <option key={officer} value={officer}>
              {officer === "Unassigned" ? "Unassigned" : officer}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>

      {!disabled && (
        <p className="text-xs text-muted-foreground">
          {currentOfficer && currentOfficer !== "Unassigned"
            ? `Currently assigned to ${currentOfficer}`
            : "No officer assigned"}
        </p>
      )}
    </div>
  )
}
