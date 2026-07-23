"use client"

import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface OfficerSelectorProps {
  currentOfficer: string
  onOfficerChange: (officer: string) => void
  disabled?: boolean
  officers?: string[]
}

export function OfficerSelector({
  currentOfficer,
  onOfficerChange,
  disabled = false,
  officers = ["Unassigned"],
}: OfficerSelectorProps) {
  return (
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
  )
}