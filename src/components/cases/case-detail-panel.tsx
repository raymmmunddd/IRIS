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
    Badge,
    Pencil,
    ArrowDown,
    Maximize2,
  } from "lucide-react"
  import { useToast } from "@/hooks/use-toast"
  import type { CaseRecord } from "@/lib/types"
  import { cn } from "@/lib/utils"
  import { TimelineDisplay } from "./timeline-display"
  import { EvidenceViewer } from "./evidence-viewer"
  import { OfficerSelector } from "./officer-selector"
  import { StatusSelector } from "./status-selector"
  import { Button } from "@/components/ui/button"
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "@/components/ui/dialog"
  import { Textarea } from "@/components/ui/textarea"
  import {
    Avatar,
    AvatarFallback,
  } from "@/components/ui/avatar"

  const priorityColors: Record<string, string> = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-orange-100 text-orange-700 border-orange-200",
    Low: "bg-yellow-100 text-yellow-700 border-yellow-200",
  }

  const categoryMeta = [
    {
      key: "violence",
      name: "Violence or Threats",
      shortName: "Violence/Threats",
      badge: "bg-pink-100 text-pink-700 border border-pink-200",
    },
    {
      key: "harassment",
      name: "Harassment & Abuse",
      shortName: "Harassment",
      badge: "bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200",
    },
    {
      key: "fraud",
      name: "Fraud & Scams",
      shortName: "Fraud/Scams",
      badge: "bg-lime-100 text-lime-700 border border-lime-200",
    },
    {
      key: "disturbance",
      name: "Public Disturbance",
      shortName: "Public Disturb.",
      badge: "bg-sky-100 text-sky-700 border border-sky-200",
    },
    {
      key: "property",
      name: "Property & Theft",
      shortName: "Property/Theft",
      badge: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    },
    {
      key: "community",
      name: "Community Dispute",
      shortName: "Community Disp.",
      badge: "bg-teal-100 text-teal-700 border border-teal-200",
    },
    {
      key: "child",
      name: "Child & Vulnerable",
      shortName: "Child/Vulnerable",
      badge: "bg-violet-100 text-violet-700 border border-violet-200",
    },
  ]

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
      case "Child & Vulnerable":
        return "bg-violet-100 text-violet-700 border-violet-200"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getCategoryMeta = (category: string) => {
    return (
      categoryMeta.find(
        (c) =>
          category
            .toLowerCase()
            .includes(c.name.toLowerCase())
      ) ?? categoryMeta[0]
    )
  }

  const statusStyles: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    "Under Review": "bg-blue-100 text-blue-700 border border-blue-200",
    Mediation: "bg-purple-100 text-purple-700 border border-purple-200",
    Resolved: "bg-green-100 text-green-700 border border-green-200",
    Closed: "bg-slate-100 text-slate-600 border border-slate-200",
    Dismissed: "bg-red-100 text-red-700 border border-red-200",
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

  const getStatusCardBorder = (status: string) => {
    switch (status) {
      case "Pending":
        return "border-yellow-200"

      case "Under Review":
        return "border-sky-200"

      case "Mediation":
        return "border-violet-200"

      case "Resolved":
        return "border-emerald-200"

      case "Closed":
        return "border-slate-300"

      case "Dismissed":
        return "border-rose-200"

      default:
        return "border-border"
    }
  }

  const getOfficerCardBorder = (officer?: string | null) => {
    if (!officer || officer === "Unassigned") {
      return "border-slate-200"
    }

    return "border-blue-200"
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

  const statusMessages: Record<
    string,
    {
      title: string
      button: string
      body: string
    }
  > = {
    "Pending->Under Review": {
      title: "Move Case to Under Review",
      button: "Continue",
      body:
        "You are about to move this case from Pending to Under Review.\n\nOnce this change has been made, it cannot be automatically reverted.\n\nThis action will be recorded in the case timeline.",
    },

    "Under Review->Mediation": {
      title: "Move Case to Mediation",
      button: "Continue",
      body:
        "The case will now proceed to mediation.\n\nResidents and assigned officers may receive updates.\n\nThis action is permanent.",
    },

    "Mediation->Resolved": {
      title: "Resolve Case",
      button: "Resolve Case",
      body:
        "This case will be marked as Resolved.\n\nResolved cases are removed from Active Cases and placed into the Archive.\n\nYou can still access archived cases at any time.",
    },

    "Resolved->Closed": {
      title: "Close Case",
      button: "Close Case",
      body:
        "Closing this case finalizes all case activities.\n\nThe case will permanently remain in the Archive.",
    },

    "Any->Dismissed": {
      title: "Dismiss Case",
      button: "Dismiss Case",
      body:
        "This case will be marked as Dismissed.\n\nThis action is permanent and will be recorded in the case timeline.",
    },
  }
  interface CaseDetailPanelProps {
    caseData: CaseRecord
    onClose: () => void
    onUpdate?: () => void
    onCaseUpdated?: (updatedCase: CaseRecord) => void
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
    onCaseUpdated,
    officers,
  }: CaseDetailPanelProps) {
    const [timelineExpanded, setTimelineExpanded] = useState(false)
    const timelineCount =
      1 + // Initial "Case Submitted" event
      (caseData.statusHistory?.length ?? 0) +
      (caseData.assignedOfficerHistory?.length ?? 0)

    const canExpandTimeline = timelineCount > 6

    const { toast } = useToast()
    const statusFlow = {
      Pending: ["Under Review", "Dismissed"],

      "Under Review": ["Mediation", "Dismissed"],

      Mediation: ["Resolved", "Dismissed"],

      Resolved: ["Closed"],

      Closed: [],

      Dismissed: [],
    }
    const [editingStatus, setEditingStatus] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState(caseData.status)
    const [confirmStatusOpen, setConfirmStatusOpen] = useState(false)
    const [editingOfficer, setEditingOfficer] = useState(false)
    const [reassignmentReason, setReassignmentReason] = useState("")
    const [confirmOfficerOpen, setConfirmOfficerOpen] = useState(false)

    const [showEvidenceViewer, setShowEvidenceViewer] = useState(false)
    const [activeEvidenceIndex, setActiveEvidenceIndex] = useState(0)

    const transitionKey =
      `${caseData.status}->${selectedStatus}`

    const dialog =
      statusMessages[transitionKey] ??
      statusMessages["Any->Dismissed"]

    const [quickOfficer, setQuickOfficer] = useState(caseData.assignedOfficer)
    const [requestInfoOpen, setRequestInfoOpen] = useState(false)
    const [requestMessage, setRequestMessage] = useState("")

    const [selectedActions, setSelectedActions] = useState<Set<ActionKey>>(new Set())

    const evidenceFiles = (caseData as any)?.evidenceFiles ??
      (caseData as any)?.evidence ??
      []

    const getExternalUrl = (file: {
      url?: string
      fileUrl?: string
    }) => {
      return file.url ?? file.fileUrl ?? "#"
    }
    const normalizedEvidenceFiles = (caseData: any) => {
    const raw = caseData?.evidenceFiles ?? caseData?.evidence ?? []

    return raw.map((file: any) => ({
      id: file.id,
      name: file.name ?? file.fileUrl?.split("/").at(-1) ?? "Evidence",
      type: file.type ?? file.fileType ?? "file",
      url: file.url ?? file.fileUrl,
      thumbnail: file.thumbnail ?? file.fileUrl,
      size: file.size ?? "Unknown size",
      uploadedAt: file.uploadedAt ?? "Unknown date",
    }))
  }

    useEffect(() => {
      console.log("CASE DATA:", caseData)
      console.log("EVIDENCE:", caseData?.evidenceFiles)
    }, [caseData])

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

    const updateCase = async (
      input: Partial<CaseRecord>
    ): Promise<CaseRecord> => {
      const res = await fetch(
        `/api/cases/${encodeURIComponent(caseData.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        }
      )

      const json = await res.json()

      if (!json.success) {
        throw new Error(json.message)
      }

      onUpdate?.()

      return json.data
    }

    const executeActions = async () => {
      try {
        if (selectedActions.has("verify")) {
          const updatedCase = await updateCase({
            status: "Under Review",
          })
          onCaseUpdated?.(updatedCase)
        }

        if (selectedActions.has("resolve")) {
          const updatedCase = await updateCase({
            status: "Resolved",
          })
          onCaseUpdated?.(updatedCase)
        }

        if (selectedActions.has("close")) {
          const updatedCase = await updateCase({
            status: "Closed",
          })
          onCaseUpdated?.(updatedCase)
        }

        if (selectedActions.has("assign")) {
          const updatedCase = await updateCase({
            assignedOfficer: quickOfficer,
          })
          onCaseUpdated?.(updatedCase)
        }

        if (selectedActions.has("mediation")) {
          const updatedCase = await updateCase({
            status: "Mediation",
          })
          onCaseUpdated?.(updatedCase)
        }
        if (selectedActions.has("request")) {
          setRequestInfoOpen(true)
        }

        setSelectedActions(new Set())
      } catch (e) {
        toast({
          variant: "destructive",
          title: "Action failed",
        })
      }
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

    const [editingNoteId, setEditingNoteId] =
      useState<string | null>(null)

    const [editingNoteContent, setEditingNoteContent] =
      useState("")

    useEffect(() => {
      async function fetchNotes() {
        try {
          const res = await fetch(`/api/cases/${caseData.id}/notes`)

          if (!res.ok) return

          const json = await res.json()

          if (json.success) {
            setNotes(json.notes)
          }
        } catch (err) {
          console.error(err)
        }
      }

      fetchNotes()
    }, [caseData.id])

    async function updateNote(id: string) {
      const res = await fetch(`/api/cases/${caseData.id}/notes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editingNoteContent,
        }),
      })

      const json = await res.json()

      if (json.success) {
        setNotes((prev) =>
          prev.map((note) =>
            note.id === id ? json.note : note
          )
        )

        setEditingNoteId(null)
        toast({
          title: "Note updated",
        })
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
            content: newNote,
          }),
        })

        const json = await res.json()

        if (json.success) {
          setNotes((prev) => [json.note, ...prev])
          setNewNote("")
          toast({
            title: "Note added",
          })
        }
      } finally {
        setSavingNote(false)
      }
    }

    const hasAssignedOfficer =
      quickOfficer &&
      quickOfficer !== "Unassigned"

    const hasCurrentOfficer =
      caseData.assignedOfficer &&
      caseData.assignedOfficer !== "Unassigned"

    const [updatingStatus, setUpdatingStatus] = useState(false)

    const handleConfirmStatusUpdate = async () => {
      if (selectedStatus === caseData.status) return

      try {
        setUpdatingStatus(true)

        const updatedCase = await updateCase({
          status: selectedStatus,
        })

        onCaseUpdated?.(updatedCase)

        toast({
          variant: "success",
          title: "Status updated successfully",
          description: `This case is now marked as ${selectedStatus}.`,
        })

        setConfirmStatusOpen(false)
        setEditingStatus(false)
      } catch {
        toast({
          variant: "error",
          title: "Status update failed",
          description: "The changes were not saved. Please try again.",
        })
      } finally {
        setUpdatingStatus(false)
      }
    }

    const closeOfficerDialog = () => {
      setConfirmOfficerOpen(false)
      setReassignmentReason("")
    }

    const handleConfirmOfficerUpdate = async () => {
      try {
        const updatedCase = await updateCase({
          assignedOfficer: quickOfficer,
          reassignmentReason,
        })

        onCaseUpdated?.(updatedCase)

        toast({
          variant: "success",
          title: "Officer updated",
          description: `${quickOfficer} has been assigned to this case.`,
        })

        setEditingOfficer(false)
        closeOfficerDialog()
      } catch {
        toast({
          variant: "destructive",
          title: "Assignment failed",
          description: "Please try again.",
        })
      }
    }

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
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto bg-muted/20">
              <div className="mx-auto max-w-5xl space-y-6 p-5">

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

                {/* CASE STATUS */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold tracking-tight">
                    Case Status
                  </h3>

                  <div
                    className={cn(
                      "rounded-xl border bg-background p-4 transition-colors",
                      getStatusCardBorder(caseData.status)
                    )}
                  >

                    {!editingStatus ? (

                      <div className="flex items-center justify-between">

                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Current Status
                          </p>

                          <p className="text-base font-semibold">
                            {caseData.status}
                          </p>
                        </div>

                        {statusFlow[caseData.status].length > 0 && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingStatus(true)}
                            className="
                              border border-slate-200
                              bg-background
                              hover:bg-slate-50
                              hover:border-slate-300
                              transition-colors
                            "
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Change
                          </Button>
                        )}

                      </div>

                    ) : (

                      <div className="space-y-4">

                        <div>
                          <p className="mb-2 text-xs text-muted-foreground">
                            Select new status
                          </p>

                          <Select
                            value={selectedStatus}
                            onValueChange={(value) =>
                              setSelectedStatus(value as CaseRecord["status"])
                            }
                          >
                            <SelectTrigger
                              className="
                                h-11
                                rounded-lg
                                border
                                border-border
                                bg-background
                                shadow-none
                                focus:ring-2
                                focus:ring-primary/20
                                focus:ring-offset-0
                              "
                            >
                              <SelectValue />
                            </SelectTrigger>

                            <SelectContent
                              className="
                                rounded-lg
                                border
                                border-border
                                bg-background
                                shadow-lg
                              "
                            >
                              <SelectItem value={caseData.status}>
                                {caseData.status}
                              </SelectItem>

                              {statusFlow[caseData.status].map((status) => (
                                <SelectItem
                                  key={status}
                                  value={status}
                                >
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                        </div>

                        <div className="flex justify-end gap-2">

                          <Button
                            variant="ghost"
                            className="
                              border border-slate-200
                              bg-background
                              text-muted-foreground
                              hover:bg-slate-50
                              hover:text-foreground
                              hover:border-slate-300
                              transition-colors
                            "
                            onClick={() => {
                              setEditingStatus(false)
                              setSelectedStatus(caseData.status)
                            }}
                          >
                            Cancel
                          </Button>

                          {selectedStatus !== caseData.status && (

                            <Button
                              className="
                                border border-primary/20
                                hover:bg-primary/90
                                hover:border-primary/40
                              "
                              onClick={() => setConfirmStatusOpen(true)}
                            >
                              Review Change
                            </Button>

                          )}

                        </div>

                      </div>

                    )}

                  </div>
                </div>

                {/* CASE ASSIGNMENT */}
                <div className="space-y-3">

                  <h3 className="text-sm font-semibold tracking-tight">
                    Case Assignment
                  </h3>

                  <div
                    className={cn(
                      "rounded-xl border bg-background p-4 transition-colors",
                      getOfficerCardBorder(quickOfficer)
                    )}
                  >

                    {!editingOfficer ? (

                      <div className="flex items-center justify-between">

                        <div className="space-y-1">

                          <p className="text-sm font-medium">
                            {hasAssignedOfficer
                              ? "Assigned Officer:"
                              : "Assign Officer:"}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {hasAssignedOfficer
                              ? quickOfficer
                              : "No officer assigned"}
                          </p>

                        </div>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingOfficer(true)}
                          className="
                            border border-slate-200
                            bg-background
                            hover:bg-slate-50
                            hover:border-slate-300
                            transition-colors
                          "
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          {hasAssignedOfficer ? "Reassign" : "Assign"}
                        </Button>

                      </div>

                    ) : (

                      <div className="space-y-4">

                        <div>
                          <p className="mb-2 text-xs text-muted-foreground">
                            Select Officer
                          </p>

                          <p className="mb-2 text-sm font-medium">
                            {hasAssignedOfficer
                              ? "Assigned Officer:"
                              : "Assign Officer:"}
                          </p>

                          <OfficerSelector
                            currentOfficer={quickOfficer}
                            officers={(officers ?? []).filter(
                              officer => officer !== "Unassigned"
                            )}
                            onOfficerChange={setQuickOfficer}
                          />

                          {!hasAssignedOfficer && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              No officer assigned
                            </p>
                          )}
                        </div>

                        <div className="flex justify-end gap-2">

                          <Button
                            variant="ghost"
                            className="
                              border border-slate-200
                              bg-background
                              text-muted-foreground
                              hover:bg-slate-50
                              hover:text-foreground
                              hover:border-slate-300
                              transition-colors
                            "
                            onClick={() => {
                              setEditingOfficer(false)
                              setQuickOfficer(caseData.assignedOfficer)
                            }}
                          >
                            Cancel
                          </Button>

                          {quickOfficer !== caseData.assignedOfficer && (

                            <Button
                            className="
                              border border-slate-200
                              bg-background
                              hover:bg-slate-50
                              hover:border-slate-300
                              transition-colors
                            "
                              onClick={() => setConfirmOfficerOpen(true)}
                            >
                              {hasAssignedOfficer ? "Reassign" : "Assign"}
                            </Button>

                          )}

                        </div>

                      </div>

                    )}

                  </div>

                </div>
                <Dialog
                  open={confirmStatusOpen}
                  onOpenChange={(open) => {
                    // Ignore outside click and Esc
                    if (!open) return
                    setConfirmStatusOpen(open)
                  }}
                >
                  <DialogContent
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    className="
                      sm:max-w-lg
                      overflow-hidden
                      rounded-2xl
                      border-2 border-amber-200
                      bg-white
                      p-0
                      gap-0
                      shadow-2xl
                    "
                  >
                    {/* HEADER */}
                    <div className="bg-amber-50 px-6 py-5">
                      <div className="flex items-start gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100">
                          <ShieldCheck className="h-5 w-5 text-amber-700" />
                        </div>

                        <div className="min-w-0">
                          <DialogTitle className="text-xl font-bold tracking-tight text-amber-950">
                            Review Status Change
                          </DialogTitle>

                          <p className="mt-1 text-sm text-amber-800">
                            Please review the changes below before continuing.
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* BODY */}
                    <div className="space-y-4 px-6 py-5">

                      <p className="text-sm leading-7 text-slate-700">
                        You are about to change the status of this case from{" "}
                        <span className="font-semibold text-slate-900">
                          {caseData.status}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold text-slate-900">
                          {selectedStatus}
                        </span>.
                      </p>

                      <p className="text-sm leading-7 text-slate-700">
                        This change will be recorded in the case timeline and may affect how
                        this case is processed and displayed throughout the system.
                      </p>

                      <p className="font-semibold text-slate-900">
                        Do you want to apply this change?
                      </p>

                      {/* ACTIONS */}
                      <div className="flex justify-end gap-3 pt-2">

                        <Button
                          variant="outline"
                          onClick={() => setConfirmStatusOpen(false)}
                          className="
                            border-slate-300
                            hover:bg-slate-50
                          "
                        >
                          Cancel
                        </Button>

                        <Button
                          disabled={updatingStatus}
                          onClick={handleConfirmStatusUpdate}
                          className="
                            bg-amber-600
                            text-white
                            hover:bg-amber-700
                          "
                        >
                          {updatingStatus ? "Updating..." : "Update Status"}
                        </Button>

                      </div>

                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={confirmOfficerOpen}
                  onOpenChange={(open) => {
                    if (!open) return
                    setConfirmOfficerOpen(open)
                  }}
                >
                  <DialogContent
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    className="
                      sm:max-w-lg
                      overflow-hidden
                      rounded-2xl
                      border-2 border-blue-200
                      bg-white
                      p-0
                      gap-0
                      shadow-2xl
                    "
                  >
                    {/* Header */}
                    <div className="bg-blue-50 px-6 py-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
                          <Badge className="h-5 w-5 text-blue-700" />
                        </div>

                        <div>
                          <DialogTitle className="text-xl font-bold text-blue-950">
                            Confirm Officer Assignment
                          </DialogTitle>

                          <p className="mt-1 text-sm text-blue-800">
                            Please review the assignment before continuing.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="space-y-4 px-6 py-5">
                      <p className="text-sm leading-7 text-slate-700">
                        {caseData.assignedOfficer &&
                        caseData.assignedOfficer !== "Unassigned" ? (
                          <>
                            You are about to reassign this case from{" "}
                            <span className="font-semibold text-slate-900">
                              {caseData.assignedOfficer}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold text-slate-900">
                              {quickOfficer}
                            </span>.
                          </>
                        ) : (
                          <>
                            You are about to assign this case to{" "}
                            <span className="font-semibold text-slate-900">
                              {quickOfficer}
                            </span>.
                          </>
                        )}
                      </p>

                      <p className="text-sm leading-7 text-slate-700">
                        This assignment will be recorded in the case timeline and the selected
                        officer will become responsible for handling this case.
                      </p>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Reason for Reassignment
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <Select
                          value={reassignmentReason}
                          onValueChange={setReassignmentReason}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="workload">
                              Officer currently has too many assigned cases
                            </SelectItem>

                            <SelectItem value="expertise">
                              Another officer has more relevant expertise
                            </SelectItem>

                            <SelectItem value="availability">
                              Current officer is unavailable
                            </SelectItem>

                            <SelectItem value="location">
                              Another officer is assigned to the incident area
                            </SelectItem>

                            <SelectItem value="conflict">
                              Potential conflict of interest
                            </SelectItem>

                            <SelectItem value="rotation">
                              Routine workload balancing
                            </SelectItem>

                            <SelectItem value="supervisor">
                              Supervisor-directed reassignment
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <p className="text-xs text-muted-foreground">
                          A reason is required before this reassignment can be confirmed.
                        </p>
                      </div>

                      <p className="font-semibold text-slate-900">
                        Do you want to continue?
                      </p>

                      <div className="flex justify-end gap-3 pt-2">
                        <Button
                          variant="ghost"
                          onClick={closeOfficerDialog}
                          className="
                            border-slate-300
                            hover:bg-slate-50
                          "
                        >
                          Cancel
                        </Button>

                        <Button
                          disabled={!reassignmentReason}
                          onClick={handleConfirmOfficerUpdate}
                          className="
                            bg-blue-600
                            text-white
                            hover:bg-blue-700
                            disabled:opacity-50
                            disabled:pointer-events-none
                          "
                        >
                          {hasAssignedOfficer
                            ? "Confirm Reassignment"
                            : "Confirm Assignment"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* EVIDENCE */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold tracking-tight">
                    Evidence
                  </h3>

                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="space-y-3">
                      {evidenceFiles.length === 0 && (
                        <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-4">
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
                        </div>
                      )}

                      {evidenceFiles.map((file, index) => (
                        <div
                          key={file.id}
                          className="
                            flex
                            items-center
                            justify-between
                            rounded-lg
                            border
                            border-border
                            bg-background
                            p-3
                            transition-colors
                            hover:bg-muted/40
                          "
                        >
                          <div className="flex items-center gap-3">

                            <div
                              className={cn(
                                "flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border",
                                file.type === "image"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-orange-50 text-orange-600"
                              )}
                            >
                              {file.type === "image" ? (
                                <img
                                  src={file.thumbnail || file.url}
                                  alt={file.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <FileText className="h-5 w-5" />
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-medium">
                                {file.name}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {file.size} • Uploaded {file.uploadedAt}
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActiveEvidenceIndex(index)
                              setShowEvidenceViewer(true)
                            }}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
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
                        ? "max-h-[420px] overflow-y-auto"
                        : "overflow-visible"
                    )}
                  >
                    <TimelineDisplay
                      dateSubmitted={caseData.dateSubmitted}
                      statusHistory={caseData.statusHistory}
                      assignedOfficerHistory={caseData.assignedOfficerHistory}
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
                  Save Note
                </Button>

              {notes.length === 0 && (
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

                  <div className="space-y-3">

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

                  </div>

                </div>

            </div>

            <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-6 py-4">

              <Button
                variant="outline"
                onClick={() => setRequestInfoOpen(true)}
                className="
                  border-blue-200
                  text-blue-700
                  hover:bg-blue-50
                  hover:border-blue-300
                "
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Request Information
              </Button>

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
                toast({
                  title: "Request sent",
                })
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