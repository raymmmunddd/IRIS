"use client"

import { useEffect, useRef } from "react"
import {
  MoreHorizontal,
  CheckCircle2,
  UserPlus,
  Calendar,
  CircleCheck,
  XCircle,
} from "lucide-react"

interface CaseActionDropdownProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  onAction: (action: string) => void
}

const actions = [
  { label: "Verify", icon: <CheckCircle2 className="h-4 w-4" />, key: "verify" },
  { label: "Assign Officer", icon: <UserPlus className="h-4 w-4" />, key: "assign" },
  { label: "Schedule Mediation", icon: <Calendar className="h-4 w-4" />, key: "mediation" },
  { label: "Mark Resolved", icon: <CircleCheck className="h-4 w-4" />, key: "resolve" },
  { label: "Close Case", icon: <XCircle className="h-4 w-4" />, key: "close" },
]

export function CaseActionDropdown({ isOpen, onToggle, onClose, onAction }: CaseActionDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Case actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-30 mt-1 w-52 rounded-xl border border-border bg-card py-1 shadow-lg">
          {actions.map((action) => (
            <button
              key={action.key}
              onClick={(e) => {
                e.stopPropagation()
                onAction(action.key)
                onClose()
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-card-foreground transition-colors hover:bg-muted"
            >
              <span className="text-muted-foreground">{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
