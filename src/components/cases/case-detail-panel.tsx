"use client"

import { useEffect, useState } from "react"
import {
  ArrowLeft,
  X,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  MapPin,
  Phone,
  User,
  Calendar,
  MessageSquare,
  Save,
  ShieldCheck,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import type { CaseRecord } from "@/lib/types"
import { cn } from "@/lib/utils"
import { TimelineDisplay } from "./timeline-display"
import { EvidenceViewer } from "./evidence-viewer"
import { OfficerSelector } from "./officer-selector"
import { StatusSelector } from "./status-selector"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface CaseDetailPanelProps {
  caseData: CaseRecord
  onClose: () => void
  onUpdate?: () => void
  officers?: string[]
}

type ActionKey =
  | "verify"
  | "assign"
  | "mediation"
  | "resolve"
  | "close"
  | "request"

export function CaseDetailPanel({
  caseData,
  onClose,
  onUpdate,
  officers = ["Unassigned"],
}: CaseDetailPanelProps) {
  const [internalNotes, setInternalNotes] = useState("")
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  const [showEvidenceViewer, setShowEvidenceViewer] = useState(false)
  const [activeEvidenceIndex, setActiveEvidenceIndex] = useState(0)

  const [quickOfficer, setQuickOfficer] = useState(caseData.assignedOfficer)
  const [requestInfoOpen, setRequestInfoOpen] = useState(false)
  const [requestMessage, setRequestMessage] = useState("")

  const [selectedActions, setSelectedActions] = useState<Set<ActionKey>>(new Set())

  const evidenceFiles = caseData.evidenceFiles ?? []
  const isArchived = caseData.status === "Resolved" || caseData.status === "Closed"

  useEffect(() => {
    setQuickOfficer(caseData.assignedOfficer)
  }, [caseData.assignedOfficer])

  const toggleAction = (key: ActionKey) => {
    setSelectedActions((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const updateCase = async (input: Partial<CaseRecord>, msg: string) => {
    const res = await fetch(`/api/cases/${encodeURIComponent(caseData.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.message)
    toast.success(msg)
    onUpdate?.()
  }

  const executeActions = async () => {
    try {
      if (selectedActions.has("verify")) {
        await updateCase({ status: "Under Review" }, "Verified")
      }
      if (selectedActions.has("resolve")) {
        await updateCase({ status: "Resolved" }, "Resolved")
      }
      if (selectedActions.has("close")) {
        await updateCase({ status: "Closed" }, "Closed")
      }
      if (selectedActions.has("assign")) {
        await updateCase({ assignedOfficer: quickOfficer }, "Assigned")
      }
      if (selectedActions.has("mediation")) {
        await updateCase({ status: "Mediation" }, "Mediation set")
      }
      if (selectedActions.has("request")) {
        setRequestInfoOpen(true)
      }

      setSelectedActions(new Set())
    } catch (e) {
      toast.error("Action failed")
    }
  }

  return (
    <>
      {/* MODAL OVERLAY */}
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden p-0 bg-card border border-border rounded-2xl">
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <DialogTitle className="text-sm font-semibold">
                {caseData.caseNumber}
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground">
                {caseData.category}
              </p>
            </div>
            <button onClick={onClose}>
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* BODY */}
          <div className="h-[75vh] overflow-y-auto p-4 space-y-4">

            {/* STATUS STRIP */}
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 rounded border">{caseData.status}</span>
              <span className="px-2 py-1 rounded border">{caseData.priority}</span>
              <span className="px-2 py-1 rounded border">{caseData.assignedOfficer}</span>
            </div>

            {/* DESCRIPTION */}
            <div className="text-sm text-muted-foreground">
              {caseData.details}
            </div>

            {/* QUICK INFO */}
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex gap-2 items-center">
                <Calendar className="h-3 w-3" />
                {caseData.dateSubmitted}
              </div>
              <div className="flex gap-2 items-center">
                <MapPin className="h-3 w-3" />
                {caseData.street}
              </div>
            </div>

            {/* STATUS + OFFICER */}
            <div className="space-y-2">
              <StatusSelector
                currentStatus={caseData.status}
                onStatusChange={(s) => updateCase({ status: s }, "Updated")}
                isArchived={isArchived}
              />

              <OfficerSelector
                currentOfficer={quickOfficer}
                officers={officers}
                onOfficerChange={setQuickOfficer}
              />
            </div>

            {/* EVIDENCE (compact) */}
            <div className="space-y-2">
              <p className="text-xs font-semibold">Evidence</p>

              {evidenceFiles.length === 0 && (
                <div className="text-xs text-muted-foreground border border-dashed p-3 rounded">
                  No evidence
                </div>
              )}

              {evidenceFiles.map((file, i) => (
                <div
                  key={file.id}
                  className="flex justify-between items-center text-xs border p-2 rounded"
                >
                  <span>{file.name}</span>
                  <button
                    onClick={() => {
                      setActiveEvidenceIndex(i)
                      setShowEvidenceViewer(true)
                    }}
                    className="text-primary"
                  >
                    view
                  </button>
                </div>
              ))}
            </div>

            {/* TIMELINE */}
            <div>
              <p className="text-xs font-semibold mb-2">Timeline</p>
              <TimelineDisplay
                dateSubmitted={caseData.dateSubmitted}
                statusHistory={caseData.statusHistory}
                assignedOfficerHistory={caseData.assignedOfficerHistory}
                actorFallback={caseData.assignedOfficer}
              />
            </div>

            {/* AI */}
            <div className="border rounded p-3 bg-blue-50 text-blue-900 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-3 w-3" />
                AI Insight
              </div>
              Recommend mediation based on escalation pattern.
            </div>

            {/* NOTES */}
            <div>
              <Textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Notes..."
                className="text-xs"
              />
              <Button
                size="sm"
                className="mt-2 w-full"
                onClick={async () => {
                  setIsSavingNotes(true)
                  await fetch(`/api/cases/${caseData.id}/notes`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ note: internalNotes }),
                  })
                  setInternalNotes("")
                  setIsSavingNotes(false)
                  toast.success("Saved")
                }}
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="border-t border-border p-3 space-y-2">

            {/* CHECKBOX ACTIONS */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ["verify", "Verify"],
                ["assign", "Assign"],
                ["mediation", "Mediation"],
                ["resolve", "Resolve"],
                ["close", "Close"],
                ["request", "Request Info"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedActions.has(key as ActionKey)}
                    onChange={() => toggleAction(key as ActionKey)}
                  />
                  {label}
                </label>
              ))}
            </div>

            <Button className="w-full" onClick={executeActions}>
              Execute Actions
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* EVIDENCE VIEWER */}
      {showEvidenceViewer && (
        <EvidenceViewer
          files={evidenceFiles}
          initialIndex={activeEvidenceIndex}
          onClose={() => setShowEvidenceViewer(false)}
        />
      )}

      {/* REQUEST INFO MODAL */}
      <Dialog open={requestInfoOpen} onOpenChange={setRequestInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Info</DialogTitle>
          </DialogHeader>

          <Textarea
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
          />

          <Button
            className="w-full"
            onClick={async () => {
              await fetch(`/api/cases/${caseData.id}/request-info`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: requestMessage }),
              })
              toast.success("Sent")
              setRequestInfoOpen(false)
            }}
          >
            Send
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}