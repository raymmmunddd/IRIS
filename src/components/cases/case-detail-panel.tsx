"use client"

import { useEffect, useState } from "react"
import {
    ArrowLeft, X, CheckCircle2, FileText, Image as ImageIcon,
    MapPin, Phone, User, Calendar, MessageSquare, Save,
    ShieldCheck, Check
} from "lucide-react"
import { toast } from "sonner"
import type { CaseRecord } from "@/lib/types"
import { cn } from "@/lib/utils"
import { TimelineDisplay } from "./timeline-display"
import { EvidenceViewer } from "./evidence-viewer"
import { OfficerSelector } from "./officer-selector"
import { StatusSelector } from "./status-selector"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface CaseDetailPanelProps {
  caseData: CaseRecord
  onClose: () => void
  onUpdate?: () => void
  isPage?: boolean
  officers?: string[]
}

export function CaseDetailPanel({ caseData, onClose, onUpdate, isPage = false, officers = ["Unassigned"] }: CaseDetailPanelProps) {
    const [internalNotes, setInternalNotes] = useState("")
    const [isSavingNotes, setIsSavingNotes] = useState(false)
    const [showEvidenceViewer, setShowEvidenceViewer] = useState(false)
    const [activeEvidenceIndex, setActiveEvidenceIndex] = useState(0)
    const [quickOfficer, setQuickOfficer] = useState(caseData.assignedOfficer || "Unassigned")
    const [requestInfoOpen, setRequestInfoOpen] = useState(false)
    const [requestMessage, setRequestMessage] = useState("")
    const [isSendingRequest, setIsSendingRequest] = useState(false)

    useEffect(() => {
        setQuickOfficer(caseData.assignedOfficer || "Unassigned")
    }, [caseData.assignedOfficer])
  
  // Tag Styles Helper
  const getPriorityStyle = (p: string) => {
    switch(p) {
      case "High": return "bg-red-100 text-red-600 border-red-200"
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Low": return "bg-green-100 text-green-700 border-green-200"
      default: return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getStatusStyle = (s: string) => {
    switch(s) {
      case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Under Review": return "bg-blue-100 text-blue-700 border-blue-200"
      case "Mediation": return "bg-purple-100 text-purple-700 border-purple-200"
      case "Resolved": return "bg-green-100 text-green-700 border-green-200"
      case "Closed": return "bg-slate-100 text-slate-600 border-slate-200"
      default: return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

    const evidenceFiles = caseData.evidenceFiles && caseData.evidenceFiles.length > 0
        ? caseData.evidenceFiles
        : []

    const isArchived = caseData.status === "Resolved" || caseData.status === "Closed"
    const aiAnalysis = caseData.aiAnalysis
    const aiScore = aiAnalysis?.score ?? (caseData.priority === "High" ? 8 : caseData.priority === "Medium" ? 5.5 : 3.5)
    const aiProgress = Math.min(100, Math.max(0, aiScore * 10))

    const updateCase = async (input: { status?: CaseRecord["status"]; assignedOfficer?: string }, successMessage: string) => {
        const response = await fetch(`/api/cases/${encodeURIComponent(caseData.id)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        })
        const result = await response.json()
        if (!result.success) throw new Error(result.message || "Unable to update case")
        toast.success(successMessage)
        onUpdate?.()
    }

    const handleStatusChange = async (nextStatus: CaseRecord["status"]) => {
        try {
            await updateCase({ status: nextStatus }, "Case status updated")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to update status")
        }
    }

    const handleOfficerChange = async (nextOfficer: string) => {
        try {
            await updateCase({ assignedOfficer: nextOfficer }, "Assigned officer updated")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to assign officer")
        }
    }

    const saveInternalNotes = async () => {
        if (!internalNotes.trim()) {
            toast.error("Write a note before saving")
            return
        }

        setIsSavingNotes(true)
        try {
            const response = await fetch(`/api/cases/${encodeURIComponent(caseData.id)}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note: internalNotes.trim() }),
            })
            const result = await response.json()
            if (!result.success) throw new Error(result.message || "Unable to save note")
            toast.success("Internal note saved")
            setInternalNotes("")
            onUpdate?.()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save note")
        } finally {
            setIsSavingNotes(false)
        }
    }

    const sendRequestInfo = async () => {
        if (!requestMessage.trim()) {
            toast.error("Write what information you need first")
            return
        }

        setIsSendingRequest(true)
        try {
            const response = await fetch(`/api/cases/${encodeURIComponent(caseData.id)}/request-info`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: requestMessage.trim() }),
            })
            const result = await response.json()
            if (!result.success) throw new Error(result.message || "Unable to send request")
            toast.success("Information request sent")
            setRequestMessage("")
            setRequestInfoOpen(false)
            onUpdate?.()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to request information")
        } finally {
            setIsSendingRequest(false)
        }
    }

    return (
        <div className={cn(
            "flex flex-col",
            isPage 
                ? "w-full h-full bg-background" 
                : "absolute inset-0 z-50 w-full h-full bg-slate-50/50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200"
        )}>
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="mx-auto max-w-7xl space-y-6 pb-12">
                    {/* Back Navigation */}
                    <div className="mb-6">
                        <button
                            onClick={onClose}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-foreground transition-colors hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Cases
                        </button>
                    </div>

                    {/* Case Header */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-foreground tracking-tight">{caseData.caseNumber}</h1>
                                <span className={cn("px-2.5 py-0.5 rounded-md text-xs font-semibold border", getPriorityStyle(caseData.priority))}>
                                    {caseData.priority} Priority
                                </span>
                                <span className={cn("px-2.5 py-0.5 rounded-md text-xs font-semibold border", getStatusStyle(caseData.status))}>
                                    {caseData.status}
                                </span>
                            </div>
                            <p className="text-muted-foreground text-lg">{caseData.category}</p>
                        </div>

                        {/* Quick Officer Display */}
                        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-lg shadow-sm">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                                {caseData.assignedOfficer.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Assigned Officer</p>
                                <p className="text-sm font-semibold text-foreground">{caseData.assignedOfficer}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column (Main Info) */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Case Details Card */}
                            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <h2 className="text-base font-semibold text-foreground mb-4">Case Details</h2>
                
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-foreground mb-1">Description</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {caseData.details || "No description provided for this case. Contact the reporter for more information."}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <span className="text-xs text-muted-foreground font-medium">Date Submitted</span>
                            <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {caseData.dateSubmitted}
                            </div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                             <span className="text-xs text-muted-foreground font-medium">Location</span>
                             <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {caseData.street || "Not specified"}
                             </div>
                        </div>
                    </div>
                </div>
              </div>

              {/* Resident Information */}
                <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <h2 className="text-base font-semibold text-foreground mb-4">Resident Information</h2>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Name</p>
                            <p className="text-sm font-medium text-foreground">{caseData.fullName}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Street</p>
                            <p className="text-sm font-medium text-foreground">{caseData.street}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Contact</p>
                            <p className="text-sm font-medium text-foreground">{caseData.contact}</p>
                        </div>
                    </div>
                </div>
              </div>

              {/* Evidence Section */}
                            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <h2 className="text-base font-semibold text-foreground mb-4">Evidence</h2>
                <div className="space-y-3">
                                        {evidenceFiles.length === 0 && (
                                            <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground">
                                                        <ImageIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">No evidence uploaded</p>
                                                        <p className="text-xs text-muted-foreground">Upload files to view them here</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {evidenceFiles.map((file, index) => (
                                            <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center",
                                                        file.type === "image" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600")}
                                                    >
                                                        {file.type === "image" ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                                                        <p className="text-xs text-muted-foreground">{file.size} - Uploaded {file.uploadedAt}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => { setActiveEvidenceIndex(index); setShowEvidenceViewer(true) }}
                                                    className="text-sm font-medium text-primary hover:text-primary/80 px-3 py-1.5 rounded-md hover:bg-primary/5 transition-colors"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        ))}
                </div>
              </div>

                            {/* Timeline */}
                            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                                <h2 className="text-base font-semibold text-foreground mb-4">Timeline</h2>
                                <TimelineDisplay
                                    dateSubmitted={caseData.dateSubmitted}
                                    statusHistory={caseData.statusHistory}
                                    assignedOfficerHistory={caseData.assignedOfficerHistory}
                                    actorFallback={caseData.assignedOfficer || caseData.shortName || "Admin"}
                                />
                            </div>

              {/* Internal Notes */}
                             <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <h2 className="text-base font-semibold text-foreground mb-4">Internal Notes</h2>
                <Textarea
                    value={internalNotes}
                    onChange={(event) => setInternalNotes(event.target.value)}
                    placeholder="Add an internal note for this case..."
                    className="mb-4 min-h-28"
                />
                <button
                    onClick={saveInternalNotes}
                    disabled={isSavingNotes}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#0f172a]/90 transition-colors disabled:opacity-60"
                >
                    <Save className="h-4 w-4" />
                    {isSavingNotes ? "Saving..." : "Save Notes"}
                </button>
              </div>

            </div>

             {/* Right Column (AI & Actions) */}
            <div className="space-y-6">

                <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
                    <div className="flex items-center gap-2 text-foreground">
                        <Check className="h-4 w-4 text-primary" />
                        <h2 className="text-base font-semibold">Case Actions</h2>
                    </div>

                    <StatusSelector
                        currentStatus={caseData.status}
                        onStatusChange={handleStatusChange}
                        isArchived={isArchived}
                        disabled={caseData.status === "Closed"}
                    />

                    <OfficerSelector
                        currentOfficer={caseData.assignedOfficer}
                        onOfficerChange={handleOfficerChange}
                        disabled={caseData.status === "Closed"}
                        officers={officers}
                    />
                </div>
                
                {/* AI Analysis Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-blue-800">
                        <ShieldCheck className="h-5 w-5" />
                        <h2 className="text-base font-semibold">AI Analysis</h2>
                    </div>
                    
                    <div className="space-y-5">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-900">Priority Score</span>
                                <span className="text-sm font-bold text-blue-700">{aiScore.toFixed(1)}/10</span>
                            </div>
                            <div className="h-2 w-full bg-blue-200/50 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${aiProgress}%` }} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border border-blue-100 bg-white/60 p-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">Category</p>
                                <p className="mt-1 text-sm font-medium text-blue-950">{caseData.category}</p>
                            </div>
                            <div className="rounded-lg border border-blue-100 bg-white/60 p-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">Confidence</p>
                                <p className="mt-1 text-sm font-medium text-blue-950">{aiAnalysis?.confidence ?? 70}%</p>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-2">AI Suggestion</h3>
                            <p className="text-sm text-blue-800/80 leading-relaxed">
                                {aiAnalysis?.suggestion ?? "Review report details, confirm jurisdiction, and request missing evidence before moving the case forward."}
                            </p>
                        </div>

                        {aiAnalysis?.reasons?.length ? (
                            <div>
                                <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-2">Signals</h3>
                                <ul className="space-y-1 text-sm text-blue-800/80">
                                    {aiAnalysis.reasons.map((reason) => (
                                        <li key={reason}>- {reason}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                </div>


                {/* Quick Actions Card */}
                <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                    <h2 className="text-base font-semibold text-foreground mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button
                            onClick={() => handleStatusChange("Under Review")}
                            disabled={caseData.status === "Closed"}
                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-left group disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                            <span className="text-sm font-medium text-foreground">Verify Case</span>
                        </button>

                        <button
                            onClick={() => setRequestInfoOpen(true)}
                            disabled={caseData.status === "Closed"}
                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-left group disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                            <span className="text-sm font-medium text-foreground">Request Info</span>
                        </button>

                        <div className="pt-2 pb-1">
                            <label className="text-xs font-semibold text-foreground mb-2 block">Assign Officer</label>
                            <div className="flex flex-col gap-2">
                                <select 
                                    value={quickOfficer}
                                    onChange={(event) => setQuickOfficer(event.target.value)}
                                    disabled={caseData.status === "Closed"}
                                    className="w-full h-10 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    {officers.map((officer) => (
                                        <option key={officer} value={officer}>{officer}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => handleOfficerChange(quickOfficer)}
                                    disabled={caseData.status === "Closed"}
                                    className="w-full h-10 px-4 bg-[#0f172a] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <User className="h-4 w-4" />
                                    Assign
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => handleStatusChange("Mediation")}
                            disabled={caseData.status === "Closed"}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium text-foreground">Schedule Mediation</span>
                        </button>

                        <button
                            onClick={() => handleStatusChange("Resolved")}
                            disabled={caseData.status === "Closed"}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm mt-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Check className="h-4 w-4" />
                            <span className="text-sm font-semibold">Mark as Resolved</span>
                        </button>
                        <button
                            onClick={() => handleStatusChange("Closed")}
                            disabled={caseData.status === "Closed"}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X className="h-4 w-4" />
                            <span className="text-sm font-semibold">Close Case</span>
                        </button>
                    </div>
                </div>

            </div>
          </div>
        </div>
      </div>

            {showEvidenceViewer && (
                <EvidenceViewer
                    onClose={() => setShowEvidenceViewer(false)}
                    files={evidenceFiles}
                    initialIndex={activeEvidenceIndex}
                />
            )}

            <Dialog open={requestInfoOpen} onOpenChange={setRequestInfoOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Request Information</DialogTitle>
                        <DialogDescription>
                            Send a case update notification to {caseData.fullName}.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={requestMessage}
                        onChange={(event) => setRequestMessage(event.target.value)}
                        placeholder="Example: Please upload a clearer photo of the incident location."
                        className="min-h-28"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRequestInfoOpen(false)} disabled={isSendingRequest}>
                            Cancel
                        </Button>
                        <Button onClick={sendRequestInfo} disabled={isSendingRequest || !requestMessage.trim()}>
                            {isSendingRequest ? "Sending..." : "Send Request"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
    </div>
  )
}
