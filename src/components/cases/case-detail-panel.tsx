"use client"

import { useEffect, useState } from "react"
import { AlertCircle, ArrowLeft, Paperclip, X } from "lucide-react"
import { updateCase } from "@/lib/caseStorage"
import type { CaseRecord } from "@/lib/types"
import { cn } from "@/lib/utils"
import { EvidenceViewer } from "./evidence-viewer"
import { OfficerSelector } from "./officer-selector"
import { StatusSelector } from "./status-selector"
import { TimelineDisplay } from "./timeline-display"

interface CaseDetailPanelProps {
  caseData: CaseRecord
  onClose: () => void
  onUpdate?: () => void
}

export function CaseDetailPanel({ caseData, onClose, onUpdate }: CaseDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "status">("profile")
  const [hasChanges, setHasChanges] = useState(false)
  const [showEvidenceViewer, setShowEvidenceViewer] = useState(false)
  const [editedStatus, setEditedStatus] = useState(caseData.status)
  const [editedOfficer, setEditedOfficer] = useState(caseData.assignedOfficer)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const isArchived = caseData.status === "Resolved" || caseData.status === "Closed"

  useEffect(() => {
    const changed =
      editedStatus !== caseData.status ||
      editedOfficer !== caseData.assignedOfficer
    setHasChanges(changed)
  }, [editedStatus, editedOfficer, caseData.status, caseData.assignedOfficer])

  const handleSaveChanges = async () => {
    setIsSaving(true)
    setSaveError(null)

    try {
      const updatedCase = updateCase(caseData.id, {
        status: editedStatus,
        assignedOfficer: editedOfficer,
      })

      if (updatedCase) {
        if (onUpdate) {
          onUpdate()
        }
        onClose()
      } else {
        setSaveError("Failed to save changes")
      }
    } catch (error) {
      setSaveError("An error occurred while saving")
      console.error("Save error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />

      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-card shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to case management</span>
          </button>
          <button onClick={onClose} className="ml-auto text-muted-foreground hover:text-foreground" aria-label="Close panel">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 border-b border-border px-6 py-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            {caseData.fullName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">{caseData.caseNumber}</p>
            <p className="truncate text-lg font-semibold text-card-foreground">{caseData.fullName}</p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
              caseData.status === "Pending" && "bg-chart-3/15 text-chart-3",
              caseData.status === "Under Review" && "bg-accent/15 text-accent",
              caseData.status === "Mediation" && "bg-chart-4/15 text-chart-4",
              caseData.status === "Resolved" && "bg-chart-6/15 text-chart-6",
              caseData.status === "Closed" && "bg-muted text-muted-foreground",
            )}
          >
            {caseData.status}
          </span>
        </div>

        <div className="flex border-b border-border px-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "relative px-1 py-3 text-sm font-medium transition-colors",
              activeTab === "profile"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Case Profile
            {activeTab === "profile" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("status")}
            className={cn(
              "relative ml-6 px-1 py-3 text-sm font-medium transition-colors",
              activeTab === "status"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Status Report
            {activeTab === "status" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === "profile" ? (
            <div className="flex flex-col gap-6">
              <section>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Resident Details:</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Gender:</label>
                    <div className="rounded-lg bg-muted px-3 py-2 text-sm text-card-foreground">
                      {caseData.gender}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Contact:</label>
                    <div className="rounded-lg bg-muted px-3 py-2 text-sm text-card-foreground">
                      {caseData.contact}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-semibold text-foreground">Email:</label>
                  <div className="rounded-lg bg-muted px-3 py-2 text-sm text-card-foreground">
                    {caseData.email}
                  </div>
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-semibold text-foreground">Street:</label>
                  <div className="rounded-lg bg-muted px-3 py-2 text-sm text-card-foreground">
                    {caseData.street}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Case Details:</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Category:</label>
                    <div className="rounded-lg bg-muted px-3 py-2 text-sm text-card-foreground">
                      {caseData.category}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Type:</label>
                    <div className="rounded-lg bg-muted px-3 py-2 text-sm text-card-foreground">
                      {caseData.type}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-semibold text-foreground">Details:</label>
                  <div className="rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed text-card-foreground">
                    {caseData.details}
                  </div>
                </div>
              </section>

              <section>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Date Submitted:</label>
                    <div className="rounded-lg bg-muted px-3 py-2 text-sm text-card-foreground">
                      {caseData.dateSubmitted}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Incident Date:</label>
                    <div className="rounded-lg bg-muted px-3 py-2 text-sm text-card-foreground">
                      {caseData.incidentDate}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <label className="mb-1 block text-xs font-semibold text-foreground">Provided Evidence:</label>
                <button
                  onClick={() => setShowEvidenceViewer(true)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg bg-muted px-3 py-2 transition-colors hover:bg-muted/80"
                >
                  <span className="text-sm text-card-foreground">
                    {caseData.evidence} File Attachment{caseData.evidence !== 1 ? "s" : ""}
                  </span>
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                </button>
              </section>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {isArchived && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>This case is archived{caseData.status === "Closed" ? " and locked" : ""}</span>
                </div>
              )}

              <section>
                <StatusSelector
                  currentStatus={editedStatus}
                  onStatusChange={setEditedStatus}
                  isArchived={caseData.status === "Closed"}
                  disabled={caseData.status === "Closed"}
                />
              </section>

              <section>
                <OfficerSelector
                  currentOfficer={editedOfficer}
                  onOfficerChange={setEditedOfficer}
                  disabled={caseData.status === "Closed"}
                />
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Priority Level</h3>
                <div
                  className={cn(
                    "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                    caseData.priority === "High" && "bg-destructive/15 text-destructive",
                    caseData.priority === "Medium" && "bg-chart-3/15 text-chart-3",
                    caseData.priority === "Low" && "bg-chart-6/15 text-chart-6",
                  )}
                >
                  {caseData.priority}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Timeline</h3>
                <TimelineDisplay
                  statusHistory={caseData.statusHistory}
                  assignedOfficerHistory={caseData.assignedOfficerHistory}
                  dateSubmitted={caseData.dateSubmitted}
                />
              </section>

              {saveError && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border bg-card px-5 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            disabled={!hasChanges || isSaving}
            onClick={handleSaveChanges}
            className={cn(
              "rounded-lg px-5 py-2 text-sm font-medium transition-colors",
              hasChanges && !isSaving
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "cursor-not-allowed bg-muted text-muted-foreground opacity-50"
            )}
          >
            {isSaving ? "Saving..." : "Update"}
          </button>
        </div>

        {showEvidenceViewer && <EvidenceViewer onClose={() => setShowEvidenceViewer(false)} />}
      </div>
    </div>
  )
}
