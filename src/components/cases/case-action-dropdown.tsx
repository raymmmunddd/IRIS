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
import type { CaseStatus } from "@/lib/types"

interface CaseActionDropdownProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  onAction: (action: string) => void
  status: CaseStatus
  hasOfficer?: boolean
}

function getActions(status: CaseStatus, hasOfficer: boolean) {
  switch (status) {
    case "Pending":
      return [
        { label: "Approve Case", icon: <CheckCircle2 className="h-4 w-4" />, key: "approve" },
        { label: "Reject Case", icon: <XCircle className="h-4 w-4" />, key: "reject" },
      ]

    case "Under Review":
      return [
        {
          label: hasOfficer ? "Reassign Officer" : "Assign Officer",
          icon: <UserPlus className="h-4 w-4" />,
          key: "assign_officer",
        },
        {
          label: "Schedule Mediation",
          icon: <Calendar className="h-4 w-4" />,
          key: "schedule_mediation",
        },
        {
          label: "Dismiss Case",
          icon: <XCircle className="h-4 w-4" />,
          key: "dismiss",
        },
      ]

    case "Mediation":
      return [
        {
          label: "Mark as Resolved",
          icon: <CircleCheck className="h-4 w-4" />,
          key: "resolve",
        },
        {
          label: "Dismiss Case",
          icon: <XCircle className="h-4 w-4" />,
          key: "dismiss",
        },
      ]

    default:
      return []
  }
}

export function CaseActionDropdown({
  isOpen,
  onToggle,
  onClose,
  onAction,
  status,
  hasOfficer,
}: CaseActionDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)

  const actions = getActions(status, hasOfficer ?? false)

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
        <div className="absolute right-0 top-full z-50 mt-2 w-56 min-w-max rounded-xl border border-border bg-card py-1 shadow-xl max-h-60 overflow-y-auto">
          
          {actions.map((action) => (
            <button
              key={action.key}
              onClick={(e) => {
                e.stopPropagation()
                onAction(action.key)
                onClose()
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-card-foreground hover:bg-muted whitespace-nowrap"
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
