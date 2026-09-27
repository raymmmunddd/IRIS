  "use client"

  import { useEffect, useState } from "react"
  import Link from "next/link"
  import {
    X,
    Download,
    FileText,
    Image as ImageIcon,
    MapPin,
    Calendar,
    MessageSquare,
    Save,
    ShieldCheck,
    Check,
    Pencil,
    Maximize2,
    ArrowLeft,
    ArrowRight,
  } from "lucide-react"
  import { useToast } from "@/hooks/use-toast"
  import type { CaseRecord } from "@/lib/types"
  import { cn } from "@/lib/utils"
import { downloadHtmlReport } from "@/lib/report-export"
  import { TimelineDisplay } from "./timeline-display"
  import { EvidenceViewer } from "./evidence-viewer"
import { ImagePreviewCard } from "@/components/evidence/image-preview-grid"
  import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh"
  import { Button } from "@/components/ui/button"
  import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
  import { Textarea } from "@/components/ui/textarea"
  import {
    Avatar,
    AvatarFallback,
  } from "@/components/ui/avatar"

  type ApiResponse = { success?: boolean; message?: string; data?: unknown }

  async function readApiResponse(response: Response): Promise<ApiResponse> {
    const body = await response.text()
    if (!body.trim()) {
      return { success: false, message: `The server returned an empty response (${response.status}).` }
    }
    try {
      return JSON.parse(body) as ApiResponse
    } catch {
      return { success: false, message: "The server returned an invalid response." }
    }
  }

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "Violence or Threats":
        return "bg-pink-100 text-pink-700 border-pink-200"
      case "Harassment & Abuse":
        return "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200"
      case "Fraud & Scams":
        return "bg-lime-100 text-lime-700 border-lime-200"
      case "Public Disturbance":
        return "bg-sky-100 text-sky-700 border-sky-200"
      case "Property & Theft":
        return "bg-indigo-100 text-indigo-700 border-indigo-200"
      case "Community Dispute":
        return "bg-teal-100 text-teal-700 border-teal-200"
      case "Child & Vulnerable Protection":
        return "bg-violet-100 text-violet-700 border-violet-200"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusStyle = (status: string) => {
      switch (status) {
          case "Pending":
              return "bg-yellow-100 text-yellow-700 border-yellow-200"
          case "Under Review":
              return "bg-blue-100 text-blue-700 border-blue-200"
          case "Mediation":
              return "bg-purple-100 text-purple-700 border-purple-200"
          case "Resolved":
              return "bg-green-100 text-green-700 border-green-200"
          case "Closed":
              return "bg-slate-100 text-slate-700 border-slate-200"
          default:
              return "bg-muted text-muted-foreground border-border"
      }
  }

  const getPriorityStyle = (priority: string) => {
      switch (priority) {
          case "High":
              return "bg-red-100 text-red-700 border-red-200"
          case "Medium":
              return "bg-yellow-100 text-yellow-700 border-yellow-200"
          case "Low":
              return "bg-green-100 text-green-700 border-green-200"
          default:
              return "bg-muted text-muted-foreground border-border"
      }
  }

  interface CaseDetailPanelProps {
    caseData: CaseRecord
    onClose: () => void
    onUpdate?: () => void
    onCaseUpdated?: (updatedCase: CaseRecord) => void
  }

  export function CaseDetailPanel({
    caseData,
    onClose,
    onUpdate,
    onCaseUpdated,
  }: CaseDetailPanelProps) {
    const [timelineExpanded, setTimelineExpanded] = useState(false)
    const timelineCount =
      1 + // Initial "Case Submitted"
      (caseData.statusHistory?.length ?? 0) +
      (caseData.assignedOfficerHistory?.length ?? 0) +
      (caseData.activityHistory?.length ?? 0)

    const TIMELINE_VISIBLE_LIMIT = 5

    const canExpandTimeline = timelineCount > TIMELINE_VISIBLE_LIMIT

    const { toast } = useToast()
    const [showEvidenceViewer, setShowEvidenceViewer] = useState(false)
    const [activeEvidenceIndex, setActiveEvidenceIndex] = useState(0)

    const [processReason, setProcessReason] = useState("")
    const [absenceParty, setAbsenceParty] = useState<"complainant" | "respondent">("complainant")
    const [arbitrationAgreement, setArbitrationAgreement] = useState("")
    const [repudiatedBy, setRepudiatedBy] = useState<"complainant" | "respondent">("complainant")
    const [updatingProcess, setUpdatingProcess] = useState(false)
    const [updatingArchive, setUpdatingArchive] = useState(false)

    const evidenceFiles = caseData.evidenceFiles

  const downloadCaseReport = () => {
    const fields = [
      ["Case number", caseData.caseNumber],
      ["Status", caseData.status],
      ["Category", caseData.category],
      ["Report type", caseData.type],
      ["Priority", caseData.priority],
      ["Complainant", caseData.fullName],
      ["Respondent", caseData.respondentName || "Not provided"],
      ["Respondent address", caseData.respondentAddress || "Not provided"],
      ["Contact", caseData.contact],
      ["Email", caseData.email],
      ["Incident location", caseData.street],
      ["Incident date", caseData.incidentDate],
      ["Date submitted", caseData.dateSubmitted],
      ["Assigned personnel", caseData.assignedOfficer || "Unassigned"],
      ["Resolution", caseData.resolution || "No resolution recorded."],
      ["Incident details", caseData.details || "No details provided."],
    ]
    downloadHtmlReport(
      `${caseData.caseNumber.replace(/[^a-z0-9-_]/gi, "_")}-report.html`,
      "IRIS Case Report",
      [{ title: `Case ${caseData.caseNumber}`, rows: fields }],
    )
  }

    type CaseNote = {
      id: string
      author: string
      content: string
      createdAt: string
      updatedAt?: string
    }

    const [notes, setNotes] = useState<CaseNote[]>([])
    const [newNote, setNewNote] = useState("")
    const [savingNote, setSavingNote] = useState(false)
    const [notesLoading, setNotesLoading] = useState(true)
    const [notesError, setNotesError] = useState("")
    const [notesReloadCount, setNotesReloadCount] = useState(0)

    const [editingNoteId, setEditingNoteId] =
      useState<string | null>(null)

    const [editingNoteContent, setEditingNoteContent] =
      useState("")

    useEffect(() => {
      async function fetchNotes() {
        try {
          setNotesLoading(true)
          setNotesError("")
          const res = await fetch(`/api/cases/${caseData.id}/notes`)
          const json = await readApiResponse(res)
          if (!res.ok || !json.success || !Array.isArray(json.data)) throw new Error(json.message || "Unable to load case notes.")
          setNotes(json.data as CaseNote[])
        } catch (error) {
          setNotesError(error instanceof Error ? error.message : "Unable to load case notes.")
        } finally {
          setNotesLoading(false)
        }
      }

      fetchNotes()
    }, [caseData.id, notesReloadCount])

    useRealtimeRefresh(async (signal) => {
      try {
        const response = await fetch(`/api/cases/${encodeURIComponent(caseData.id)}/notes`, { signal })
        const result = await readApiResponse(response)
        if (!response.ok || !result.success || !Array.isArray(result.data)) throw new Error(result.message || "Unable to refresh case notes.")
        setNotes(result.data as CaseNote[])
      } catch {
        // Keep the current note list and retry on the next refresh.
      }
    }, { topics: ["iris:cases"], enabled: Boolean(caseData.id), fetchOnMount: false, refreshKey: caseData.id })

    async function updateNote(id: string) {
      try {
        const res = await fetch(`/api/cases/${caseData.id}/notes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editingNoteContent }),
        })
        const json = await readApiResponse(res)
        if (!res.ok || !json.success || !json.data) throw new Error(json.message || "Unable to update note.")
        const updatedNote = json.data as CaseNote
        setNotes((prev) =>
          prev.map((note) =>
            note.id === id ? updatedNote : note
          )
        )

        setEditingNoteId(null)
        toast({
          title: "Note updated",
        })
      } catch (error) {
        toast({ variant: "destructive", title: "Note update failed", description: error instanceof Error ? error.message : "Unable to update note." })
      }
    }

    async function saveNote() {
      if (!newNote.trim()) return

      setSavingNote(true)

      try {
        const res = await fetch(`/api/cases/${caseData.id}/notes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            note: newNote,
          }),
        })

        const json = await readApiResponse(res)
        if (!res.ok || !json.success || !json.data) throw new Error(json.message || "Unable to add note.")
        setNotes((prev) => [json.data as CaseNote, ...prev])
        setNewNote("")
        toast({ title: "Note added" })
      } catch (error) {
        toast({ variant: "destructive", title: "Note could not be added", description: error instanceof Error ? error.message : "Unable to add note." })
      } finally {
        setSavingNote(false)
      }
    }

    const sendCaseProcessEvent = async (event: string, payload: Record<string, unknown> = {}) => {
      setUpdatingProcess(true)
      try {
        const response = await fetch(`/api/cases/${encodeURIComponent(caseData.id)}/transition`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event, payload }),
        })
        const result = await readApiResponse(response)
        if (!response.ok || !result.success || !result.data) throw new Error(result.message || "Unable to update the case workflow.")
        onCaseUpdated?.(result.data as CaseRecord)
        onUpdate?.()
        setProcessReason("")
        setArbitrationAgreement("")
        toast({ title: "Case workflow updated", description: result.message })
      } catch (error) {
        toast({ variant: "destructive", title: "Workflow update failed", description: error instanceof Error ? error.message : "Please try again." })
      } finally {
        setUpdatingProcess(false)
      }
    }

    const setCaseArchived = async (archived: boolean) => {
      setUpdatingArchive(true)
      try {
        const response = await fetch(`/api/cases/${encodeURIComponent(caseData.id)}/archive`, { method: archived ? "POST" : "DELETE" })
        const result = await readApiResponse(response)
        if (!response.ok || !result.success || !result.data) throw new Error(result.message || "Unable to update archive status.")
        onCaseUpdated?.(result.data as CaseRecord)
        onUpdate?.()
        toast({ title: archived ? "Case archived" : "Case restored" })
      } catch (error) {
        toast({ variant: "destructive", title: archived ? "Archive failed" : "Restore failed", description: error instanceof Error ? error.message : "Please try again." })
      } finally {
        setUpdatingArchive(false)
      }
    }

    const processStatus = caseData.currentStatus ?? "SCHEDULED"
    const canArchiveProcess = processStatus === "DISMISSED"
      || processStatus === "WITHDRAWN"
      || (processStatus === "RESOLVED" && Boolean(caseData.closedDate))

    return (
      <>
        {/* MODAL OVERLAY */}
        <Dialog open onOpenChange={onClose}>
          <DialogContent
            showCloseButton={false}
            className="
              w-[96vw]
              max-w-7xl
              h-[92vh]
              overflow-hidden
              p-0
              gap-0
            "
          >
          {/* HEADER */}
          <div className="sticky top-0 z-30 border-b border-border/40 bg-card px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold tracking-tight">
                  Case Details
                </DialogTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {caseData.caseNumber}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{caseData.type}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium",
                      getPriorityStyle(caseData.priority)
                    )}
                  >
                    {caseData.priority}
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium",
                      getCategoryStyle(caseData.category)
                    )}
                  >
                    {caseData.category}
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium",
                      getStatusStyle(caseData.status)
                    )}
                  >
                    {caseData.status}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button type="button" variant="outline" onClick={downloadCaseReport} title="Download case report">
                  <Download className="mr-2 h-4 w-4" />
                  Download report
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                  title="Close case details"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto bg-muted/20">
              <div className="mx-auto max-w-5xl space-y-6 p-4">

                {/* DESCRIPTION */}
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">
                    Description
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {caseData.details || "No description provided."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="leading-tight">
                      <p className="text-[11px] text-muted-foreground">
                        Date Submitted
                      </p>
                      <p className="mt-0.5 text-sm font-medium">
                        {caseData.dateSubmitted}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="leading-tight">
                      <p className="text-[11px] text-muted-foreground">
                        Location
                      </p>
                      <p className="mt-0.5 text-sm font-medium">
                        {caseData.street}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 rounded-xl border bg-background p-4 sm:grid-cols-2">
                  <div><p className="text-xs text-muted-foreground">Respondent</p><p className="text-sm font-medium">{caseData.respondentName || "Not provided"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Respondent address</p><p className="text-sm font-medium">{caseData.respondentAddress || "Not provided"}</p></div>
                </div>

                <section className="space-y-4 rounded-xl border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold tracking-tight">Dispute resolution stage</h3>
                      <p className="mt-1 text-base font-semibold">{processStatus}</p>
                    </div>
                    {caseData.statusDaysAllotted == null ? (
                      <p className="text-sm text-muted-foreground">No day limit is set for this stage.</p>
                    ) : (
                      <div className="text-right text-sm">
                        <p>{caseData.statusDaysElapsed ?? 0} of {caseData.statusDaysAllotted} business days elapsed</p>
                        <p className={caseData.statusOverdue ? "font-semibold text-destructive" : "text-muted-foreground"}>
                          {caseData.statusOverdue ? `Overdue by ${Math.abs(caseData.statusDaysRemaining ?? 0)} business days` : `${caseData.statusDaysRemaining ?? 0} business days remaining`}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                    <span>Mediation attempts: {caseData.mediationAttemptCount ?? 0}/3</span>
                    <span>Conciliation attempts: {caseData.conciliationAttemptCount ?? 0}/3</span>
                    <span>Complainant absences: {caseData.absenceCount ?? 0}/3</span>
                  </div>
                  {(processStatus === "MEDIATION" || processStatus === "CONCILIATION") && (
                    <p className="text-sm text-muted-foreground">Schedule each follow-up hearing in <Link href="/operations" className="font-medium text-primary underline">Operations</Link> before recording its outcome.</p>
                  )}
                  {caseData.needsCertificateToFileAction && <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Certificate to File Action is needed after conciliation was exhausted without an arbitration agreement.</p>}
                  {caseData.arbitrationAgreementSigned && <p className="text-sm text-muted-foreground">Arbitration agreement signed {caseData.arbitrationAgreementDate ?? "date not recorded"}.</p>}
                  {caseData.settlementDate && <p className="text-sm text-muted-foreground">Settlement recorded {caseData.settlementDate} through {caseData.settlementSource?.toLowerCase() ?? "an unrecorded source"}.</p>}
                  {caseData.arbitrationAwardDate && <p className="text-sm text-muted-foreground">Arbitration award rendered {caseData.arbitrationAwardDate}.</p>}
                  {processStatus === "REPUDIATION" && <p className="rounded-lg border bg-muted/40 p-3 text-sm">Repudiated by {caseData.repudiatedBy?.toLowerCase() ?? "a party"} on {caseData.repudiationDate ?? "an unrecorded date"}{caseData.repudiationReason ? `: ${caseData.repudiationReason}` : "."}</p>}
                  {processStatus === "DISMISSED" && caseData.dismissalReason && <p className="rounded-lg border bg-muted/40 p-3 text-sm">Dismissal reason: {caseData.dismissalReason}</p>}
                  {processStatus === "WITHDRAWN" && caseData.withdrawalReason && <p className="rounded-lg border bg-muted/40 p-3 text-sm">Withdrawal reason: {caseData.withdrawalReason}</p>}

                  {processStatus === "SCHEDULED" && (
                    <p className="text-sm text-muted-foreground">Schedule the first mediation hearing in <Link href="/operations" className="font-medium text-primary underline">Operations</Link> to begin this stage.</p>
                  )}
                  {(processStatus === "MEDIATION" || processStatus === "CONCILIATION") && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" disabled={updatingProcess || (processStatus === "CONCILIATION" && (caseData.conciliationAttemptCount ?? 0) >= 3 && !arbitrationAgreement)} onClick={() => sendCaseProcessEvent("not_settled", processStatus === "CONCILIATION" && arbitrationAgreement ? { arbitration_agreement_signed: arbitrationAgreement === "true" } : {})}>
                          {processStatus === "MEDIATION" ? "Continue mediation" : "Continue conciliation"}
                        </Button>
                        <Button type="button" variant="outline" disabled={updatingProcess} onClick={() => sendCaseProcessEvent("settled")}><ArrowRight className="mr-1.5 h-4 w-4" />Forward: Resolve case</Button>
                      </div>
                      {processStatus === "CONCILIATION" && (caseData.conciliationAttemptCount ?? 0) >= 3 && (
                        <label className="block space-y-1 text-sm">
                          <span>Arbitration agreement signed?</span>
                          <select value={arbitrationAgreement} onChange={(event) => setArbitrationAgreement(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2">
                            <option value="">Choose one</option>
                            <option value="true">Yes, signed</option>
                            <option value="false">No agreement</option>
                          </select>
                        </label>
                      )}
                      <div className="flex flex-wrap items-end gap-2">
                        <label className="space-y-1 text-sm">
                          <span>Absent party</span>
                          <select value={absenceParty} onChange={(event) => setAbsenceParty(event.target.value as "complainant" | "respondent")} className="block rounded-lg border border-border bg-background px-3 py-2">
                            <option value="complainant">Complainant</option>
                            <option value="respondent">Respondent</option>
                          </select>
                        </label>
                        <Button type="button" variant="outline" disabled={updatingProcess} onClick={() => sendCaseProcessEvent("absent", { absent_by: absenceParty })}>Record absence</Button>
                      </div>
                      <div className="flex flex-wrap items-end gap-2">
                        <label className="min-w-60 flex-1 space-y-1 text-sm">
                          <span>Withdrawal reason</span>
                          <input value={processReason} onChange={(event) => setProcessReason(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2" />
                        </label>
                        <Button type="button" variant="outline" disabled={updatingProcess || !processReason.trim()} onClick={() => sendCaseProcessEvent("withdrawn", { reason: processReason })}>Withdraw case</Button>
                      </div>
                    </div>
                  )}
                  {processStatus === "ARBITRATION" && <Button type="button" disabled={updatingProcess} onClick={() => sendCaseProcessEvent("award_rendered")}><ArrowRight className="mr-1.5 h-4 w-4" />Forward: Record arbitration award</Button>}
                  {processStatus === "RESOLVED" && !caseData.closedDate && caseData.settlementSource !== "ARBITRATION" && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">File any repudiation by {caseData.repudiationDeadline ?? "the end of the 10 business day window"}.</p>
                      <div className="flex flex-wrap items-end gap-2">
                        <label className="space-y-1 text-sm">
                          <span>Repudiated by</span>
                          <select value={repudiatedBy} onChange={(event) => setRepudiatedBy(event.target.value as "complainant" | "respondent")} className="block rounded-lg border border-border bg-background px-3 py-2">
                            <option value="complainant">Complainant</option>
                            <option value="respondent">Respondent</option>
                          </select>
                        </label>
                        <label className="min-w-60 flex-1 space-y-1 text-sm">
                          <span>Repudiation reason</span>
                          <input value={processReason} onChange={(event) => setProcessReason(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2" />
                        </label>
                        <Button type="button" variant="outline" disabled={updatingProcess || !processReason.trim()} onClick={() => sendCaseProcessEvent("repudiated", { repudiated_by: repudiatedBy, reason: processReason })}><ArrowRight className="mr-1.5 h-4 w-4" />Forward: File repudiation</Button>
                      </div>
                    </div>
                  )}
                  {processStatus === "RESOLVED" && caseData.closedDate && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{caseData.settlementSource === "ARBITRATION" ? `Arbitration award became binding on ${caseData.closedDate}.` : `Closed ${caseData.closedDate}.`} Execution deadline: {caseData.executionDeadline ?? "not set"}{caseData.executionMethod ? ` · ${caseData.executionMethod.toLowerCase()} execution` : ""}</p>
                      <Button type="button" variant="outline" disabled={updatingProcess} onClick={() => sendCaseProcessEvent("execution_needed")}>Track execution</Button>
                    </div>
                  )}
                  {processStatus === "REPUDIATION" && (
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" disabled={updatingProcess} onClick={() => sendCaseProcessEvent("resume")}><ArrowLeft className="mr-1.5 h-4 w-4" />Backward: Resume prior stage</Button>
                      <Button type="button" variant="outline" disabled={updatingProcess} onClick={() => sendCaseProcessEvent("withdrawn")}>Withdraw after repudiation</Button>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    {caseData.isArchived ? (
                      <Button type="button" variant="outline" disabled={updatingArchive} onClick={() => setCaseArchived(false)}>{updatingArchive ? "Restoring…" : "Restore from archive"}</Button>
                    ) : (
                      <Button type="button" variant="outline" disabled={updatingArchive || !canArchiveProcess} onClick={() => setCaseArchived(true)} title={!canArchiveProcess ? "Close, dismiss, or withdraw the case before archiving it." : undefined}>
                        {updatingArchive ? "Archiving…" : "Archive case"}
                      </Button>
                    )}
                  </div>
                </section>

                {/* EVIDENCE */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold tracking-tight">
                    Evidence
                  </h3>

                  <div className="rounded-xl border border-border bg-background p-4">
                    <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
                      {evidenceFiles.length === 0 && (
                        <li className="flex items-center gap-3 rounded-lg border border-dashed border-border p-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <div>
                            <p className="text-sm font-medium">
                              No evidence uploaded
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Photos and documents will appear here.
                            </p>
                          </div>
                        </li>
                      )}

                      {evidenceFiles.map((file, index) => (
                        file.type === "image" ? (
                          <ImagePreviewCard
                            key={file.id}
                            item={{
                              id: file.id,
                              name: file.name,
                              src: file.thumbnail || file.url,
                              details: `${file.size} · Uploaded ${file.uploadedAt}`,
                            }}
                            onPreview={() => {
                              setActiveEvidenceIndex(index)
                              setShowEvidenceViewer(true)
                            }}
                          />
                        ) : (
                          <li key={file.id} className="overflow-hidden rounded-xl border border-border bg-background">
                            <button type="button" onClick={() => { setActiveEvidenceIndex(index); setShowEvidenceViewer(true) }} className="group block w-full text-left">
                              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-orange-50 text-orange-600">
                                <FileText className="h-5 w-5" />
                                <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">Preview</span>
                              </div>
                              <div className="min-w-0 p-3">
                                <p className="truncate text-sm font-semibold">{file.name}</p>
                                <p className="mt-1 truncate text-xs text-muted-foreground">{file.size} · Uploaded {file.uploadedAt}</p>
                              </div>
                            </button>
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                </div>

              {/* TIMELINE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold tracking-tight">
                    Timeline
                  </h3>

                  {canExpandTimeline && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTimelineExpanded(true)}
                      aria-label="Expand timeline"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-border
                    bg-background
                    overflow-hidden
                  "
                >
                  <div
                    className={cn(
                      "px-5 py-4 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent",
                      canExpandTimeline
                        ? "max-h-[340px] overflow-y-auto"
                        : "overflow-visible"
                    )}
                  >
                    <TimelineDisplay
                      dateSubmitted={caseData.dateSubmitted}
                      statusHistory={caseData.statusHistory}
                      assignedOfficerHistory={caseData.assignedOfficerHistory}
                      activityHistory={caseData.activityHistory}
                      actorFallback={caseData.assignedOfficer}
                    />
                  </div>
                </div>
              </div>
              <Dialog
                open={timelineExpanded}
                onOpenChange={setTimelineExpanded}
              >
                <DialogContent
                  className="
                    w-[92vw]
                    max-w-4xl
                    h-[78vh]
                    overflow-hidden
                    rounded-2xl
                    p-0
                    gap-0
                  "
                >
                  {/* Header */}
                  <div className="sticky top-0 z-20 border-b bg-card px-6 py-4">
                    <div className="flex items-center justify-between">

                      <DialogTitle className="text-xl font-bold">
                        Timeline
                      </DialogTitle>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTimelineExpanded(false)}
                        title="Close timeline"
                        aria-label="Close timeline"
                      >
                        <X className="h-4 w-4" />
                      </Button>

                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto bg-muted/20">
                    <div className="mx-auto max-w-5xl p-6">

                      <TimelineDisplay
                        dateSubmitted={caseData.dateSubmitted}
                        statusHistory={caseData.statusHistory}
                        assignedOfficerHistory={caseData.assignedOfficerHistory}
                        activityHistory={caseData.activityHistory}
                        actorFallback={caseData.assignedOfficer}
                      />

                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* AI INSIGHT */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold tracking-tight">
                  AI Insight
                </h3>

                <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-900">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-sm font-semibold">
                        AI Recommendation
                      </span>
                    </div>

                    <span className="text-sm font-bold text-blue-700">
                      8.0 / 10
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-blue-200/50">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: "80%" }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">

                    <div className="flex-1 rounded-lg border border-blue-100 bg-white/70 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-800">
                        Category
                      </p>

                      <p className="mt-1 text-sm font-medium text-blue-950">
                        {caseData.category}
                      </p>
                    </div>

                    <div className="w-28 rounded-lg border border-blue-100 bg-white/70 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-800">
                        Confidence
                      </p>

                      <p className="mt-1 text-sm font-medium text-blue-950">
                        87%
                      </p>
                    </div>

                  </div>

                  <div className="mt-3 border-t border-blue-100 pt-3">

                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-blue-800">
                      Recommendation
                    </p>

                    <p className="text-xs leading-5 text-blue-900/80">
                      Recommend mediation based on escalation patterns and the available
                      evidence. Additional witness statements may improve confidence before
                      resolution.
                    </p>

                  </div>

                </div>
              </div>

              {/* NOTES */}
              <div>
                <h3 className="text-sm font-semibold tracking-tight">
                  Internal Notes
                </h3>

                <p className="text-xs text-muted-foreground">
                  Visible only to barangay personnel.
                </p>
              </div>

                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={4}
                />

              <Button
                  onClick={saveNote}
                  disabled={savingNote || !newNote.trim()}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {savingNote ? "Saving note..." : "Save Note"}
                </Button>

              {notesError && (
                <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <span>{notesError}</span>
                  <button type="button" onClick={() => setNotesReloadCount((count) => count + 1)} className="font-semibold underline">Retry</button>
                </div>
              )}

              {notesLoading && <div aria-label="Loading notes" className="h-20 animate-pulse rounded-lg bg-muted" />}

              {!notesLoading && !notesError && notes.length === 0 && (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <MessageSquare className="mx-auto h-6 w-6 text-muted-foreground" />

                  <p className="mt-2 text-sm font-medium">
                    No notes yet
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Internal case notes will appear here.
                  </p>
                </div>
              )}

                  {!notesLoading && notes.length > 0 && <div className="space-y-3">

                    {notes.map((note) => (

                      <div
                        key={note.id}
                        className="rounded-lg border p-4"
                      >

                        <div className="flex items-start gap-3">

                          <Avatar className="h-9 w-9">

                            <AvatarFallback>
                              {note.author
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>

                          </Avatar>

                          <div className="flex-1">

                            <div className="flex items-center justify-between">

                              <div>

                                <p className="font-medium text-sm">
                                  {note.author}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {note.updatedAt
                                    ? `Edited ${note.updatedAt}`
                                    : note.createdAt}
                                </p>

                              </div>

                              {editingNoteId !== note.id && (

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Edit note"
                                  aria-label="Edit note"
                                  onClick={() => {
                                    setEditingNoteId(note.id)
                                    setEditingNoteContent(note.content)
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>

                              )}

                            </div>

                            {editingNoteId === note.id ? (

                              <div className="space-y-3 mt-3">

                                <Textarea
                                  value={editingNoteContent}
                                  onChange={(e) =>
                                    setEditingNoteContent(e.target.value)
                                  }
                                />

                                <div className="flex justify-end gap-2">

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="
                                      border border-slate-200
                                      bg-background
                                      text-muted-foreground
                                      hover:bg-slate-50
                                      hover:text-foreground
                                      hover:border-slate-300
                                      transition-colors
                                    "
                                    onClick={() =>
                                      setEditingNoteId(null)
                                    }
                                  >
                                    <X className="mr-1 h-4 w-4" />
                                    Cancel
                                  </Button>

                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      updateNote(note.id)
                                    }
                                  >
                                    <Check className="mr-1 h-4 w-4" />
                                    Save
                                  </Button>

                                </div>

                              </div>

                            ) : (

                              <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                                {note.content}
                              </p>

                            )}

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>}

                </div>

            </div>

            <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-6 py-4">

<Button
                variant="secondary"
                className="
                  border border-border
                  hover:bg-secondary
                  hover:brightness-95
                  transition-all
                "
                onClick={onClose}
              >
                Close
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


      </>
    )
  }
