"use client"

import { Calendar, User, AlertCircle } from "lucide-react"
import type { StatusHistoryEntry, OfficerHistoryEntry } from "@/lib/types"

interface TimelineDisplayProps {
  statusHistory?: StatusHistoryEntry[]
  assignedOfficerHistory?: OfficerHistoryEntry[]
  dateSubmitted: string
}

interface TimelineEvent {
  type: "status" | "officer" | "submitted"
  timestamp: string
  displayTime: string
  title: string
  description: string
}

function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    // If parsing fails, try treating it as MM/DD/YYYY format
    if (isoString.includes("/")) {
      return isoString
    }
    return "Invalid date"
  }
}

export function TimelineDisplay({
  statusHistory = [],
  assignedOfficerHistory = [],
  dateSubmitted,
}: TimelineDisplayProps) {
  // Combine all events
  const events: TimelineEvent[] = []

  // Add status changes
  statusHistory.forEach((entry) => {
    events.push({
      type: "status",
      timestamp: entry.changedAt,
      displayTime: formatDateTime(entry.changedAt),
      title: `Status changed to '${entry.status}'`,
      description: `Status updated to ${entry.status}`,
    })
  })

  // Add officer assignments
  assignedOfficerHistory.forEach((entry) => {
    events.push({
      type: "officer",
      timestamp: entry.assignedAt,
      displayTime: formatDateTime(entry.assignedAt),
      title: `Officer assigned: ${entry.officer}`,
      description: `${entry.officer === "Unassigned" ? "No officer assigned" : `Assigned to ${entry.officer}`}`,
    })
  })

  // Add initial submission
  events.push({
    type: "submitted",
    timestamp: dateSubmitted,
    displayTime: formatDateTime(dateSubmitted),
    title: "Case submitted",
    description: "Initial case submission",
  })

  // Sort by timestamp (newest first)
  events.sort((a, b) => {
    const aTime = new Date(a.timestamp).getTime()
    const bTime = new Date(b.timestamp).getTime()
    return bTime - aTime
  })

  return (
    <div className="space-y-3">
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No timeline history available</p>
      ) : (
        <div className="space-y-2">
          {events.map((event, index) => (
            <div key={`${event.type}-${index}`} className="flex gap-3 text-sm">
              {/* Icon */}
              <div className="flex shrink-0 pt-0.5">
                {event.type === "status" && (
                  <AlertCircle className="h-4 w-4 text-chart-3" />
                )}
                {event.type === "officer" && (
                  <User className="h-4 w-4 text-accent" />
                )}
                {event.type === "submitted" && (
                  <Calendar className="h-4 w-4 text-card-foreground/60" />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-card-foreground">{event.title}</p>
                <p className="text-xs text-muted-foreground">{event.displayTime}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
