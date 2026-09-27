"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, SlidersHorizontal, X, FolderOpen, Archive, ArrowLeft, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import type { CaseRecord, CaseStatus, CaseCategory, CasePriority, CaseProcessStatus } from "@/lib/types"
import { CaseActionDropdown } from "./case-action-dropdown"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ArrowUpDown, ArrowUp, ArrowDown, TriangleAlert } from "lucide-react"
import { matchesCaseSearch } from "@/lib/case-search"

const allStatuses: CaseProcessStatus[] = [
  "SCHEDULED",
  "MEDIATION",
  "CONCILIATION",
  "ARBITRATION",
  "RESOLVED",
  "REPUDIATION",
  "DISMISSED",
  "WITHDRAWN",
]
const allCategories: ("All" | CaseCategory)[] = [
  "All",
  "Violence or Threats",
  "Harassment & Abuse",
  "Fraud & Scams",
  "Public Disturbance",
  "Property & Theft",
  "Community Dispute",
  "Child & Vulnerable Protection",
]
const allPriorities: ("All" | CasePriority)[] = ["All", "Urgent", "High", "Medium", "Low"]

const priorityColors: Record<string, string> = {
  Urgent: "bg-red-100 text-red-800 border border-red-300",
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-orange-100 text-orange-700 border-orange-200",
  Low: "bg-yellow-100 text-yellow-700 border-yellow-200",
}

const categoryMeta = [
  {
    key: "violence",
    name: "Violence or Threats",
    shortName: "Violence or Threats",
    badge: "bg-red-100 text-red-700 border border-red-200",
  },
  {
    key: "harassment",
    name: "Harassment & Abuse",
    shortName: "Harassment & Abuse",
    badge: "bg-purple-100 text-purple-700 border border-purple-200",
  },
  {
    key: "fraud",
    name: "Fraud & Scams",
    shortName: "Fraud & Scams",
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  {
    key: "disturbance",
    name: "Public Disturbance",
    shortName: "Public Disturbance",
    badge: "bg-green-100 text-green-700 border border-green-200",
  },
  {
    key: "property",
    name: "Property & Theft",
    shortName: "Property & Theft",
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  {
    key: "community",
    name: "Community Dispute",
    shortName: "Community Dispute",
    badge: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  },
  {
    key: "protection",
    name: "Child & Vulnerable Protection",
    shortName: "Child & Vulnerable Protection",
    badge: "bg-pink-100 text-pink-700 border border-pink-200",
  },
]

const getCategoryMeta = (category: string) => {
  return categoryMeta.find(
    (item) => item.name.toLowerCase() === category.toLowerCase()
  ) ?? {
    key: "other",
    name: category,
    shortName: category,
    badge: "bg-slate-100 text-slate-700 border border-slate-200",
  }
}

const statusStyles: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700 border border-blue-200",
  MEDIATION: "bg-purple-100 text-purple-700 border border-purple-200",
  CONCILIATION: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  ARBITRATION: "bg-orange-100 text-orange-700 border border-orange-200",
  RESOLVED: "bg-green-100 text-green-700 border border-green-200",
  REPUDIATION: "bg-amber-100 text-amber-700 border border-amber-200",
  DISMISSED: "bg-red-100 text-red-700 border border-red-200",
  WITHDRAWN: "bg-slate-100 text-slate-600 border border-slate-200",
  Pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  "Under Review": "bg-blue-100 text-blue-700 border border-blue-200",
  Mediation: "bg-purple-100 text-purple-700 border border-purple-200",
  Resolved: "bg-green-100 text-green-700 border border-green-200",
  Closed: "bg-slate-100 text-slate-600 border border-slate-200",
  Dismissed: "bg-red-100 text-red-700 border border-red-200",
}

const avatarColors: Record<string, string> = {
  high: "bg-[#1e3a5f] text-[#60a5fa]",
  medium: "bg-[#2d4a3d] text-[#4ade80]",
  low: "bg-[#3d2d2d] text-[#f87171]",
}

const priorityWeight: Record<string, number> = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
}

type CaseAction = "assign" | "mediation"

const actionTitles: Record<CaseAction, string> = {
  assign: "Assign Officer",
  mediation: "Schedule Mediation",
}

const categoryStyles: Record<string, string> = Object.fromEntries(
  categoryMeta.map((c) => [c.name, c.badge])
)

interface CasesTableProps {
  cases: CaseRecord[]
  onViewCase?: (caseData: CaseRecord) => void
  onUpdated?: () => void
}

export function CasesTable({
  cases,
  onViewCase,
  onUpdated,
}: CasesTableProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "ARCHIVED" | CaseProcessStatus>("ALL")

  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterOpen &&
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }
  }, [filterOpen])

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])

  const [categoryFilter, setCategoryFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")

  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [openActionId, setOpenActionId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const categoryOptions = useMemo(
    () => ["All", ...new Set([...allCategories.slice(1), ...cases.map((caseItem) => caseItem.category).filter(Boolean)])],
    [cases],
  )
  const [sortBy, setSortBy] = useState<"Latest" | "Oldest" | "Priority">("Latest")
  const [officers, setOfficers] = useState<string[]>(["Unassigned"])
  const [pendingAction, setPendingAction] = useState<{ action: CaseAction; caseItem: CaseRecord } | null>(null)
  const [selectedOfficer, setSelectedOfficer] = useState("")
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)
  const [actionError, setActionError] = useState("")
  const [workflowSavingId, setWorkflowSavingId] = useState<string | null>(null)
  const router = useRouter()

  const [scheduledAt, setScheduledAt] = useState("")

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleTabChange = (tab: "ALL" | "ARCHIVED" | CaseProcessStatus) => {
    if (tab === activeTab) return

    setSelectedStatuses([])
    setFilterOpen(false)
    setActiveTab(tab)
  }

  async function updateCase(caseId: string, input: { status?: CaseStatus; assignedOfficer?: string; scheduledAt?: string }) {
    const response = await fetch(`/api/cases/${encodeURIComponent(caseId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const result = await response.json()
    if (!response.ok || !result.success) throw new Error(result.message || "Unable to update case.")
    onUpdated?.()
    return result.data as CaseRecord
  }

  async function sendWorkflowEvent(caseItem: CaseRecord, event: string, payload: Record<string, unknown> = {}) {
    setWorkflowSavingId(caseItem.id)
    try {
      const response = await fetch(`/api/cases/${encodeURIComponent(caseItem.id)}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, payload }),
      })
      const body = await response.text()
      const result = body.trim() ? JSON.parse(body) as { success?: boolean; message?: string } : null
      if (!response.ok || !result?.success) throw new Error(result?.message || "Unable to update case status.")
      toast.success(result.message || "Case status updated.")
      onUpdated?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update case status.")
    } finally {
      setWorkflowSavingId(null)
    }
  }

  const filtered = useMemo(() => {
    const sourceCases = cases.filter((caseItem) => {
      if (activeTab === "ARCHIVED") {
        return caseItem.isArchived === true
      }

      return caseItem.isArchived !== true
        && (activeTab === "ALL" || (caseItem.currentStatus ?? "SCHEDULED") === activeTab)
    })

    let result = sourceCases.filter((c) => {
      if (
        selectedStatuses.length > 0 &&
        !selectedStatuses.includes(c.currentStatus ?? "SCHEDULED")
      ) {
        return false
      }
      if (categoryFilter !== "All" && c.category !== categoryFilter) return false
      if (priorityFilter !== "All" && c.priority !== priorityFilter) return false

      if (dateFrom) {
        const caseDate = new Date(c.date)
        const fromDate = new Date(dateFrom)
        fromDate.setHours(0, 0, 0, 0)

        if (caseDate < fromDate) return false
      }

      if (dateTo) {
        const caseDate = new Date(c.date)
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)

        if (caseDate > toDate) return false
      }

      if (searchQuery) {
        return matchesCaseSearch(c, searchQuery)
      }

      return true
    })

    result = [...result].sort((a, b) => {
      const dateA = Date.parse(a.date)
      const dateB = Date.parse(b.date)

      if (sortBy === "Latest") return dateB - dateA
      if (sortBy === "Oldest") return dateA - dateB

      if (sortBy === "Priority") {
        return (
          (priorityWeight[b.priority] ?? 0) -
          (priorityWeight[a.priority] ?? 0)
        )
      }

      return 0
    })

    return result
    }, [
      cases,
      selectedStatuses,
      categoryFilter,
      priorityFilter,
      searchQuery,
      activeTab,
      refreshTrigger,
      sortBy,
      dateFrom,
      dateTo,
    ])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, selectedStatuses, categoryFilter, priorityFilter, dateFrom, dateTo, searchQuery, sortBy])

  const pageSize = 12
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visiblePage = Math.min(currentPage, pageCount)
  const visibleCases = filtered.slice((visiblePage - 1) * pageSize, visiblePage * pageSize)

  function handleAction(action: string, caseItem: CaseRecord) {
    let mappedAction: CaseAction

    switch (action) {
      case "assign_officer":
        mappedAction = "assign"
        break
      case "schedule_mediation":
        mappedAction = "mediation"
        break
      default:
        return
    }

    setActionError("")
    const assignableOfficers = officers.filter((o) => o !== "Unassigned")

    setSelectedOfficer(
      caseItem.assignedOfficer !== "Unassigned"
        ? caseItem.assignedOfficer
        : assignableOfficers[0] ?? "Unassigned"
    )

    setPendingAction({ action: mappedAction, caseItem })
    setOpenActionId(null)
  }

  async function confirmAction() {
    if (!pendingAction) return

    const { action, caseItem } = pendingAction
    const input: {
      status?: CaseStatus
      assignedOfficer?: string
      scheduledAt?: string
    } = {}

    if (action === "assign") {
      if (!selectedOfficer) {
        setActionError("Select an officer before assigning this case.")
        return
      }
      input.assignedOfficer = selectedOfficer
    }
    if (action === "mediation") {
      if (!scheduledAt) {
        setActionError("Please select a mediation date.")
        return
      }

      input.status = "Mediation"
      input.scheduledAt = scheduledAt
    }

    try {
      setIsSubmittingAction(true)
      await updateCase(caseItem.id, input)
      handleRefresh()
      setPendingAction(null)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to update this case.")
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const getAvatarColor = (priority: CasePriority) => {
    return "bg-muted text-muted-foreground"
  }

  const pendingCount = cases.filter(
    (c) => c.status === "Pending"
  ).length

  const archiveCount = cases.filter(
    (c) => c.isArchived === true
  ).length

  const activeCount = cases.filter(
    (c) =>
      c.isArchived !== true
  ).length

  const prioritySummaryStyles: Record<string, string> = {
    Urgent: "bg-red-100 text-red-800 border border-red-300",
    High: "bg-red-100 text-red-700 border border-red-200",
    Medium: "bg-orange-100 text-orange-700 border border-orange-200",
    Low: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  }

  function getProgressStep(status: CaseStatus) {
    switch (status) {
      case "Pending":
        return 1

      case "Under Review":
        return 2

      case "Mediation":
        return 3

      case "Resolved":
          return 4

      case "Closed":
        return 4

      case "Dismissed":
        return 4

      default:
        return 1
    }
  }

  return (
    <>
      <div className="mt-2 mb-2 flex items-center gap-2 overflow-x-auto border-b border-border pb-2">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          {[{ value: "ALL" as const, label: "All Cases", count: activeCount }, ...allStatuses.map((status) => ({ value: status, label: status[0] + status.slice(1).toLowerCase(), count: cases.filter((item) => item.isArchived !== true && (item.currentStatus ?? "SCHEDULED") === status).length }))].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabChange(tab.value)}
              aria-pressed={activeTab === tab.value}
              className={cn(
                "group flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200",
                activeTab === tab.value
                  ? "border-[#1e4fa3] bg-[#e8f0ff] text-[#1e4fa3] shadow-sm"
                  : "border-border bg-card text-muted-foreground"
              )}
            >
              {tab.value === "ALL" && <FolderOpen className="h-4 w-4" />}
              <span>{tab.label}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", activeTab === tab.value ? "bg-[#1e4fa3] text-white" : "bg-muted text-muted-foreground")}>{tab.count}</span>
            </button>
          ))}
          <button
            onClick={() => handleTabChange("ARCHIVED")}
            type="button"
            aria-pressed={activeTab === "ARCHIVED"}
            className={cn(
              "group flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200",
              activeTab === "ARCHIVED"
                ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                : "border-border bg-card text-muted-foreground"
            )}
          >
            <Archive className="h-4 w-4" />
            <span>Archived</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                activeTab === "ARCHIVED"
                  ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {archiveCount}
            </span>
          </button>
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center">
          <button
            onClick={() => {
              setSortBy((prev) =>
              prev === "Latest"
                ? "Oldest"
                : prev === "Oldest"
                ? "Priority"
                : "Latest"
              )
            }}
            className={cn(
              "group flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200",
              "border-border bg-card text-muted-foreground hover:border-[#1e4fa3]/30 hover:bg-muted hover:text-foreground"
            )}
          >
            {sortBy === "Latest" && <ArrowUpDown className="h-4 w-4" />}
            {sortBy === "Oldest" && <ArrowUpDown className="h-4 w-4" />}
            {sortBy === "Priority" && <ArrowUpDown className="h-4 w-4" />}
            <span>{sortBy}</span>
          </button>
        </div>
      </div>

      {/* Filter Container */}
      <div className="mb-5 relative">
        <div className="relative">
          {/* Filter Icon */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={cn(
              "absolute left-3 top-1/2 z-20 -translate-y-1/2",
              "flex h-9 w-9 items-center justify-center rounded-lg",
              "bg-muted/60 text-muted-foreground",
              "transition-all duration-200",
              "hover:bg-muted hover:text-foreground",
              filterOpen &&
                "bg-[#e8f0ff] text-[#1e4fa3]"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          {/* Search */}
          <Search className="absolute left-14 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search case number, complainant, respondent, or officer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              h-11
              w-full
              rounded-2xl
              border-0
              bg-card
              pl-20
              pr-4
              text-sm
              shadow-sm
              ring-1
              ring-border/40
              placeholder:text-muted-foreground
              focus:ring-2
              focus:ring-[#1e4fa3]/20
              focus:outline-none
            "
          />
          {/* Filter Counter */}
          {(selectedStatuses.length > 0 ||
            categoryFilter !== "All" ||
            priorityFilter !== "All" ||
            dateFrom ||
            dateTo) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="rounded-full bg-[#1e4fa3] px-2 py-0.5 text-[11px] font-semibold text-white">
              {selectedStatuses.length +
                (categoryFilter !== "All" ? 1 : 0) +
                (priorityFilter !== "All" ? 1 : 0) +
                (dateFrom || dateTo ? 1 : 0)}
              </div>
            </div>
          )}
        </div>
        {/* Filter Panel */}
        {filterOpen && (
        <div
          ref={filterRef}
          className="
            absolute
            left-0
            top-[52px]
            z-50
            w-full
            max-w-xl
            h-[380px]
            rounded-2xl
            bg-card
            p-5
            shadow-xl
            ring-1
            ring-border/40
            backdrop-blur
            flex
            flex-col
          "
        >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold">
                  Filter Cases
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Refine your results by status, category, priority, and date.
                </p>
              </div>
              <button
                onClick={() => setFilterOpen(false)}
                className="
                  rounded-xl
                  p-2
                  text-muted-foreground
                  hover:bg-muted
                "
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div
              className="
                max-h-[320px]
                overflow-y-auto
                pr-2
                space-y-5
                scrollbar-thin
                scrollbar-thumb-border
                scrollbar-track-transparent
              "
            >
            {/* Active Filters Summary */}
            {(selectedStatuses.length > 0 ||
              categoryFilter !== "All" ||
              priorityFilter !== "All") && (
              <div className="mb-3 flex flex-wrap gap-2 rounded-xl bg-muted/30 p-1">
                {selectedStatuses.map((s) => (
                <div
                  key={s}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
                    statusStyles[s]
                  )}
                >
                    {s}
                    <button
                      onClick={() =>
                        setSelectedStatuses((prev) =>
                          prev.filter((item) => item !== s)
                        )
                      }
                      className="
                        flex h-4 w-4 items-center justify-center
                        rounded-full
                        hover:bg-[#dbe8ff]
                      "
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {categoryFilter !== "All" && (
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
                    categoryStyles[categoryFilter]
                  )}
                >
                  {categoryFilter}
                  <button
                    onClick={() => setCategoryFilter("All")}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                )}
                {priorityFilter !== "All" && (
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
                    priorityColors[priorityFilter]
                  )}
                >
                  {priorityFilter}
                  <button
                    onClick={() => setPriorityFilter("All")}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                )}
              </div>
            )}
            {/* Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">
                  Status
                </Label>
                {selectedStatuses.length > 0 && (
                  <span className="text-[11px] text-[#1e4fa3] font-medium">
                    {selectedStatuses.length} selected
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allStatuses.map((status) => {
                  const selected = selectedStatuses.includes(status)

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setSelectedStatuses((prev) =>
                          prev.includes(status)
                            ? prev.filter((s) => s !== status)
                            : [...prev, status]
                        )
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        selected
                          ? statusStyles[status]
                          : "bg-muted/30 text-muted-foreground border border-border/60 hover:bg-muted"
                      )}
                    >
                      {status}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Category & Priority */}
            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Category
                  </Label>
                  {categoryFilter !== "All" && (
                    <span className="text-[11px] text-[#1e4fa3] font-medium">
                      Selected
                    </span>
                  )}
                </div>
                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                    max-h-[110px]
                    overflow-y-auto
                    pr-1
                    scrollbar-thin
                    scrollbar-thumb-border
                    scrollbar-track-transparent
                  "
                >
                  {categoryOptions
                    .filter((c) => c !== "All")
                    .map((category) => {
                      const selected = categoryFilter === category
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() =>
                            setCategoryFilter(
                              selected ? "All" : category
                            )
                          }
                          className={cn(
                            "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                          selected
                            ? categoryStyles[category]
                            : "bg-muted/30 text-muted-foreground border border-border/60 hover:bg-muted"
                          )}
                        >
                          {category}
                        </button>
                      )
                    })}
                </div>
              </div>
              <div className="space-y-2 mt-5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Priority
                  </Label>
                  {priorityFilter !== "All" && (
                    <span className="text-[11px] text-[#1e4fa3] font-medium">
                      Selected
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {allPriorities
                    .filter((p) => p !== "All")
                    .map((priority) => {

                      const selected =
                        priorityFilter === priority

                      const styles: Record<string, string> = {
                        High:
                          "bg-red-100 text-red-700 border-red-200",

                        Medium:
                          "bg-yellow-100 text-yellow-700 border-yellow-200",

                        Low:
                          "bg-green-100 text-green-700 border-green-200",
                      }

                      return (
                        <button
                          key={priority}
                          type="button"
                          onClick={() =>
                            setPriorityFilter(
                              selected ? "All" : priority
                            )
                          }
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                            selected
                              ? priorityColors[priority]
                              : "bg-muted/30 text-muted-foreground border border-border/60 hover:bg-muted"
                          )}
                        >
                          {priority}
                        </button>
                      )
                    })}
                </div>
              </div>
              {/* Date Range */}
              <div className="space-y-2 mt-5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Date Range
                  </Label>

                  {(dateFrom || dateTo) && (
                    <div
                      className="
                        flex items-center gap-1
                        rounded-full
                        bg-indigo-50
                        px-2.5 py-1
                        text-[11px]
                        text-indigo-700
                      "
                    >
                      {dateFrom || "Any"} → {dateTo || "Any"}

                      <button
                        onClick={() => {
                          setDateFrom("")
                          setDateTo("")
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="mb-1 block text-[11px] text-muted-foreground">
                      From
                    </Label>
                    <input
                      type="date"
                      value={dateFrom}
                      max={dateTo || undefined}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="
                        w-full rounded-xl border border-border
                        bg-card px-3 py-2 text-sm
                        focus:outline-none focus:ring-2
                        focus:ring-[#1e4fa3]/20
                      "
                    />
                  </div>

                  <div>
                    <Label className="mb-1 block text-[11px] text-muted-foreground">
                      To
                    </Label>
                    <input
                      type="date"
                      value={dateTo}
                      min={dateFrom || undefined}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="
                        w-full rounded-xl border border-border
                        bg-card px-3 py-2 text-sm
                        focus:outline-none focus:ring-2
                        focus:ring-[#1e4fa3]/20
                      "
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

            {/* Actions */}
            <div className="mt-5 flex justify-between">

              <button
                onClick={() => {
                  setSelectedStatuses([])
                  setCategoryFilter("All")
                  setPriorityFilter("All")
                  setDateFrom("")
                  setDateTo("")
                  setSearchQuery("")
                }}
                className="
                  text-sm
                  font-medium
                  text-muted-foreground
                  hover:text-foreground
                "
              >
                Clear Filters
              </button>

              <Button
                onClick={() => setFilterOpen(false)}
                className="rounded-xl"
              >
                Done
              </Button>

            </div>

          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleCases.map((caseItem) => (
          <div
            key={caseItem.id}
            onClick={() =>
              onViewCase?.(caseItem)
            }
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-2xl border bg-card p-5 shadow-sm",
              "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg",
              caseItem.priority === "Urgent" &&
                "border-red-300 hover:border-red-400 dark:border-red-800",
              caseItem.priority === "High" &&
                "border-red-200 hover:border-red-300 dark:border-red-900/40",
              caseItem.priority === "Medium" &&
                "border-yellow-200 hover:border-yellow-300 dark:border-yellow-900/40",
              caseItem.priority === "Low" &&
                "border-green-200 hover:border-green-300 dark:border-green-900/40",
              "hover:border-primary/30"
            )}
          >
              {/* Progress Bar */}
              <div className="-mx-5 -mt-5 mb-4 flex h-1 overflow-hidden">
                <div
                  className={cn(
                    "flex-1",
                    getProgressStep(caseItem.status) >= 1
                      ? "bg-yellow-500"
                      : "bg-muted"
                  )}
                />
                <div
                  className={cn(
                    "flex-1",
                    getProgressStep(caseItem.status) >= 2
                      ? "bg-blue-500"
                      : "bg-muted"
                  )}
                />
                <div
                  className={cn(
                    "flex-1",
                    getProgressStep(caseItem.status) >= 3
                      ? "bg-purple-500"
                      : "bg-muted"
                  )}
                />
                <div
                  className={cn(
                    "flex-1",
                    getProgressStep(caseItem.status) >= 4
                      ? "bg-green-500"
                      : "bg-muted"
                  )}
                />
              </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {caseItem.caseNumber}
                </p>

                <h3 className="mt-2 text-base font-semibold text-card-foreground">
                  {caseItem.fullName?.trim() || caseItem.shortName}
                </h3>

                {/* Date & Time */}
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(caseItem.date).toLocaleString("en-PH", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>

                {/* Description */}
                <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {caseItem.details}
                </div>
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <CaseActionDropdown
                  isOpen={openActionId === caseItem.id}
                  onToggle={() =>
                    setOpenActionId(
                      openActionId === caseItem.id ? null : caseItem.id
                    )
                  }
                  onClose={() => setOpenActionId(null)}
                  onAction={(action) => handleAction(action, caseItem)}
                  status={caseItem.status}
                  hasOfficer={!!caseItem.assignedOfficer}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                  priorityColors[caseItem.priority]
                )}
              >
                {caseItem.priority}
              </span>

              {(() => {
                const category = getCategoryMeta(caseItem.category)

                return (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                      category.badge
                    )}
                  >
                    {category.shortName}
                  </span>
                )
              })()}

              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                  statusStyles[caseItem.currentStatus ?? "SCHEDULED"]
                )}
              >
                {caseItem.currentStatus ?? "SCHEDULED"}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
              {(caseItem.currentStatus ?? "SCHEDULED") === "SCHEDULED" && (
                <Button type="button" size="sm" variant="outline" onClick={() => handleAction("schedule_mediation", caseItem)}>
                  <ArrowRight className="mr-1.5 h-3.5 w-3.5" />Forward: Schedule mediation
                </Button>
              )}
              {(caseItem.currentStatus === "MEDIATION" || caseItem.currentStatus === "CONCILIATION") && (
                <>
                  <Button type="button" size="sm" variant="outline" disabled={workflowSavingId === caseItem.id || (caseItem.currentStatus === "CONCILIATION" && (caseItem.conciliationAttemptCount ?? 0) >= 3)} onClick={() => sendWorkflowEvent(caseItem, "not_settled")}>
                    Continue stage
                  </Button>
                  <Button type="button" size="sm" disabled={workflowSavingId === caseItem.id} onClick={() => sendWorkflowEvent(caseItem, "settled")}>
                    <ArrowRight className="mr-1.5 h-3.5 w-3.5" />Forward: Resolve
                  </Button>
                  {caseItem.currentStatus === "CONCILIATION" && (caseItem.conciliationAttemptCount ?? 0) >= 3 && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => onViewCase?.(caseItem)}>Choose next stage</Button>
                  )}
                </>
              )}
              {caseItem.currentStatus === "ARBITRATION" && (
                <Button type="button" size="sm" disabled={workflowSavingId === caseItem.id} onClick={() => sendWorkflowEvent(caseItem, "award_rendered")}>
                  <ArrowRight className="mr-1.5 h-3.5 w-3.5" />Forward: Record award
                </Button>
              )}
              {caseItem.currentStatus === "RESOLVED" && !caseItem.closedDate && caseItem.settlementSource !== "ARBITRATION" && (
                <Button type="button" size="sm" variant="outline" onClick={() => onViewCase?.(caseItem)}>
                  <ArrowRight className="mr-1.5 h-3.5 w-3.5" />Forward: File repudiation
                </Button>
              )}
              {caseItem.currentStatus === "REPUDIATION" && (
                <Button type="button" size="sm" variant="outline" disabled={workflowSavingId === caseItem.id} onClick={() => sendWorkflowEvent(caseItem, "resume")}>
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Backward: Resume prior stage
                </Button>
              )}
            </div>

            {/* Divider */}
            <div className="my-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Footer */}
            <p className="text-xs text-muted-foreground">
              Assigned:{" "}
              <span className="font-medium text-card-foreground">
                {caseItem.assignedOfficer}
              </span>
            </p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          No cases found matching your filters.
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(visiblePage - 1) * pageSize + 1}–{Math.min(visiblePage * pageSize, filtered.length)} of {filtered.length} cases
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={visiblePage <= 1}>
              Previous
            </Button>
            <span className="min-w-20 text-center text-sm text-muted-foreground">Page {visiblePage} of {pageCount}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={visiblePage >= pageCount}>
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-border bg-card shadow-2xl">
    
    {/* Header */}
    <DialogHeader className="space-y-1">
      <DialogTitle className="text-base font-semibold text-card-foreground">
        {pendingAction ? actionTitles[pendingAction.action] : "Case Action"}
      </DialogTitle>

      <DialogDescription className="text-xs text-muted-foreground">
        {pendingAction?.caseItem.caseNumber} • {pendingAction?.caseItem.fullName}
      </DialogDescription>
    </DialogHeader>

    {/* Content Card */}
    <div className="mt-2 rounded-xl border border-border bg-muted/30 p-4 space-y-3">

      {pendingAction?.action === "assign" ? (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Select Officer
          </Label>

          <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
            <SelectTrigger className="w-full bg-card border border-border text-sm">
              <SelectValue placeholder="Choose officer" />
            </SelectTrigger>

            <SelectContent className="bg-card border border-border shadow-lg">
              {officers
                .filter((o) => o !== "Unassigned")
                .map((officer) => (
                  <SelectItem key={officer} value={officer}>
                    {officer}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <p className="text-[11px] text-muted-foreground">
            Assigning will immediately move case responsibility
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm text-card-foreground">
            {pendingAction?.action === "mediation" && (
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Schedule Mediation Date & Time
                </Label>

                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => { setActionError(""); setScheduledAt(e.target.value) }}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-primary/20"
                />

                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                  Choose the date and time for the mediation hearing.
                </div>

                {scheduledAt && (
                  <div className="text-xs text-muted-foreground">
                    Selected:{" "}
                    <span className="font-medium text-card-foreground">
                      {new Date(scheduledAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    {actionError && (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {actionError}
      </div>
    )}
    <DialogFooter className="flex gap-2 pt-2">

      <Button
        variant="outline"
        onClick={() => setPendingAction(null)}
        disabled={isSubmittingAction}
        className="flex-1"
      >
        Cancel
      </Button>

      <Button
        onClick={confirmAction}
        disabled={isSubmittingAction}
        className="flex-1 bg-primary hover:bg-primary/90"
      >
        {isSubmittingAction ? "Processing..." : "Confirm"}
      </Button>

    </DialogFooter>
  </DialogContent>
      </Dialog>
    </>
  )
}
