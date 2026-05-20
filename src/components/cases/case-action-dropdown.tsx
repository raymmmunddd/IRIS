"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import {
  MoreHorizontal,
  CheckCircle2,
  UserPlus,
  Calendar,
  CircleCheck,
  XCircle,
  RotateCcw,
  Trash2,
} from "lucide-react"

interface CaseActionDropdownProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  onAction: (action: string) => void
  mode?: "default" | "archive"
}

type MenuAction = {
  label: string
  icon: React.ReactNode
  key: string
  danger?: boolean
}

const actions: MenuAction[] = [
  { label: "Verify", icon: <CheckCircle2 className="h-4 w-4" />, key: "verify" },
  { label: "Assign Officer", icon: <UserPlus className="h-4 w-4" />, key: "assign" },
  { label: "Schedule Mediation", icon: <Calendar className="h-4 w-4" />, key: "mediation" },
  { label: "Mark Resolved", icon: <CircleCheck className="h-4 w-4" />, key: "resolve" },
  { label: "Close Case", icon: <XCircle className="h-4 w-4" />, key: "close" },
]

const archiveActions: MenuAction[] = [
  { label: "Restore", icon: <RotateCcw className="h-4 w-4" />, key: "restore" },
  { label: "Delete", icon: <Trash2 className="h-4 w-4" />, key: "delete", danger: true },
]

export function CaseActionDropdown({ isOpen, onToggle, onClose, onAction, mode = "default" }: CaseActionDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)
  const visibleActions = mode === "archive" ? archiveActions : actions

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
        <div className="absolute right-0 top-full z-[80] mt-1 w-52 rounded-xl border border-border bg-card py-1 shadow-xl">
          {visibleActions.map((action) => (
            <button
              key={action.key}
              onClick={(e) => {
                e.stopPropagation()
                onAction(action.key)
                onClose()
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted ${
                action.danger ? "text-red-600" : "text-card-foreground"
              }`}
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
