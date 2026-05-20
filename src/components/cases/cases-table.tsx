"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Archive, Clock3, FolderOpen } from "lucide-react"
import type { CaseRecord, CaseStatus, CaseCategory, CasePriority } from "@/lib/types"
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
import { ArrowUpDown } from "lucide-react"
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime"

const allStatuses: ("All" | CaseStatus)[] = ["All", "Pending", "Under Review", "Mediation", "Resolved", "Closed"]
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
const allPriorities: ("All" | CasePriority)[] = ["All", "High", "Medium", "Low"]

const priorityColors: Record<string, string> = {
  High: "bg-red-100 text-red-600 border border-red-200",
  Medium: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  Low: "bg-green-100 text-green-700 border border-green-200",
}

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  "Under Review": "bg-blue-100 text-blue-700 border border-blue-200",
  Mediation: "bg-purple-100 text-purple-700 border border-purple-200",
  Resolved: "bg-green-100 text-green-700 border border-green-200",
  Closed: "bg-slate-100 text-slate-600 border border-slate-200",
}

type CaseAction = "verify" | "assign" | "mediation" | "resolve" | "close" | "restore" | "delete"

type CasesResponse = {
  items: CaseRecord[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  counts: {
    pending: number
    active: number
    archive: number
  }
}

const actionTitles: Record<CaseAction, string> = {
  verify: "Verify Case",
  assign: "Assign Officer",
  mediation: "Move to Mediation",
  resolve: "Resolve Case",
  close: "Close Case",
  restore: "Restore Case",
  delete: "Delete Case",
}

export function CasesTable() {
  const [activeTab, setActiveTab] = useState<
  "pending" | "active" | "archive"
>("pending")
  const [statusFilter, setStatusFilter] = useState<"All" | CaseStatus>("All")
  const [categoryFilter, setCategoryFilter] = useState<"All" | CaseCategory>("All")
  const [priorityFilter, setPriorityFilter] = useState<"All" | CasePriority>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [openActionId, setOpenActionId] = useState<string | null>(null)
  const [cases, setCases] = useState<CaseRecord[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<CasesResponse["pagination"]>({
    page: 1,
    pageSize: 6,
    total: 0,
    totalPages: 1,
  })
  const [counts, setCounts] = useState<CasesResponse["counts"]>({
    pending: 0,
    active: 0,
    archive: 0,
  })
  const [isLoadingCases, setIsLoadingCases] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [sortBy, setSortBy] = useState<"Newest" | "Oldest" | "Priority">("Newest")
  const [officers, setOfficers] = useState<string[]>(["Unassigned"])
  const [pendingAction, setPendingAction] = useState<{ action: CaseAction; caseItem: CaseRecord } | null>(null)
  const [selectedOfficer, setSelectedOfficer] = useState("")
  const [mediationDate, setMediationDate] = useState("")
  const [mediationTime, setMediationTime] = useState("")
  const [mediationLocation, setMediationLocation] = useState("Barangay East Tapinac Hall")
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)
  const [actionError, setActionError] = useState("")
  const router = useRouter()

  const loadCases = useCallback(async () => {
    try {
      setLoadError("")
      const params = new URLSearchParams({
        page: String(page),
        limit: "6",
        tab: activeTab,
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        search: searchQuery,
        sort: sortBy,
      })
      const response = await fetch(`/api/cases?${params.toString()}`)
      const result = await response.json()
      if (!result.success) throw new Error(result.message)
      const data = result.data as CasesResponse
      setCases(data.items)
      setPagination(data.pagination)
      setCounts(data.counts)
    } catch (error) {
      console.error("Failed to load cases:", error)
      setLoadError(error instanceof Error ? error.message : "Failed to load cases.")
    } finally {
      setIsLoadingCases(false)
    }
  }, [activeTab, categoryFilter, page, priorityFilter, searchQuery, sortBy, statusFilter])

  useSupabaseRealtime(["cases", "hearings"], loadCases)

  async function updateCase(caseId: string, input: { status?: CaseStatus; assignedOfficer?: string }) {
    const response = await fetch(`/api/cases/${encodeURIComponent(caseId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const result = await response.json()
    if (!result.success) throw new Error(result.message)
    await loadCases()
    return result.data as CaseRecord
  }

  async function deleteCase(caseId: string) {
    const response = await fetch(`/api/cases/${encodeURIComponent(caseId)}`, {
      method: "DELETE",
    })
    const result = await response.json()
    if (!result.success) throw new Error(result.message)
    await loadCases()
  }

  async function restoreCase(caseId: string) {
    const response = await fetch(`/api/cases/${encodeURIComponent(caseId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore" }),
    })
    const result = await response.json()
    if (!result.success) throw new Error(result.message)
    await loadCases()
    return result.data as CaseRecord
  }

  useEffect(() => {
    async function loadOfficers() {
      try {
        const response = await fetch("/api/officers")
        const result = await response.json()
        if (result.success) setOfficers(result.data)
      } catch (error) {
        console.error("Failed to load officers:", error)
      }
    }
    loadOfficers()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [activeTab, statusFilter, categoryFilter, priorityFilter, searchQuery, sortBy])

  useEffect(() => {
    let cancelled = false
    setIsLoadingCases(true)
    setLoadError("")
    const params = new URLSearchParams({
      page: String(page),
      limit: "6",
      tab: activeTab,
      status: statusFilter,
      category: categoryFilter,
      priority: priorityFilter,
      search: searchQuery,
      sort: sortBy,
    })
    const timeout = window.setTimeout(() => {
      fetch(`/api/cases?${params.toString()}`)
        .then((response) => response.json())
        .then((result) => {
          if (cancelled) return
          if (!result.success) throw new Error(result.message)
          const data = result.data as CasesResponse
          setCases(data.items)
          setPagination(data.pagination)
          setCounts(data.counts)
        })
        .catch((error) => {
          if (!cancelled) {
            console.error("Failed to load cases:", error)
            setLoadError(error instanceof Error ? error.message : "Failed to load cases.")
            setCases([])
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoadingCases(false)
        })
    }, searchQuery ? 250 : 0)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [activeTab, categoryFilter, page, priorityFilter, searchQuery, sortBy, statusFilter])

  function handleAction(action: string, caseItem: CaseRecord) {
    const nextAction = action as CaseAction
    const assignableOfficers = officers.filter((officer) => officer !== "Unassigned")
    setActionError("")
    setSelectedOfficer(
      caseItem.assignedOfficer !== "Unassigned" ? caseItem.assignedOfficer : assignableOfficers[0] ?? "",
    )
    if (nextAction === "mediation") {
      setMediationDate(new Date().toISOString().slice(0, 10))
      setMediationTime("")
      setMediationLocation("Barangay East Tapinac Hall")
    }
    setPendingAction({ action: nextAction, caseItem })
    setOpenActionId(null)
  }

  async function confirmAction() {
    if (!pendingAction) return

    const { action, caseItem } = pendingAction
    const input: { status?: CaseStatus; assignedOfficer?: string } = {}

    if (action === "delete") {
      try {
        setIsSubmittingAction(true)
        await deleteCase(caseItem.id)
        setPendingAction(null)
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "Unable to delete this case.")
      } finally {
        setIsSubmittingAction(false)
      }
      return
    }

    if (action === "restore") {
      try {
        setIsSubmittingAction(true)
        await restoreCase(caseItem.id)
        setPendingAction(null)
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "Unable to restore this case.")
      } finally {
        setIsSubmittingAction(false)
      }
      return
    }

    if (action === "verify") input.status = "Under Review"
    if (action === "assign") {
      if (!selectedOfficer) {
        setActionError("Select an officer before assigning this case.")
        return
      }
      input.assignedOfficer = selectedOfficer
    }
    if (action === "mediation") {
      if (!mediationDate || !mediationTime || !mediationLocation.trim()) {
        setActionError("Choose a hearing date, time, and location before scheduling.")
        return
      }
      try {
        setIsSubmittingAction(true)
        const response = await fetch("/api/operations/hearings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caseId: caseItem.id,
            mediator: selectedOfficer || undefined,
            scheduledDate: mediationDate,
            scheduledTime: mediationTime,
            location: mediationLocation.trim(),
          }),
        })
        const result = await response.json()
        if (!result.success) throw new Error(result.message)
        await loadCases()
        setPendingAction(null)
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "Unable to schedule mediation.")
      } finally {
        setIsSubmittingAction(false)
      }
      return
    }
    if (action === "resolve") input.status = "Resolved"
    if (action === "close") input.status = "Closed"

    try {
      setIsSubmittingAction(true)
      await updateCase(caseItem.id, input)
      setPendingAction(null)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to update this case.")
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const pendingCount = counts.pending
  const archiveCount = counts.archive
  const activeCount = counts.active
  const today = new Date().toISOString().slice(0, 10)

  return (
    <>
      <div className="mt-2 mb-2 flex items-center gap-2 overflow-x-auto border-b border-border pb-2">

        {/* LEFT SIDE: Tabs */}
        <div className="flex items-center gap-2">
          
          {/* Pending */}
          <button
            onClick={() => {
              setActiveTab("pending")
              setStatusFilter("All")
              setCategoryFilter("All")
              setPriorityFilter("All")
              setSearchQuery("")
            }}
            className={cn(
              "group flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200",
              activeTab === "pending"
                ? "border-[#1e4fa3] bg-[#e8f0ff] text-[#1e4fa3] shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-[#1e4fa3]/30 hover:bg-muted hover:text-foreground"
            )}
          >
            <Clock3 className="h-4 w-4" />
            <span>Pending</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                activeTab === "pending"
                  ? "bg-[#1e4fa3] text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {pendingCount}
            </span>
          </button>

          {/* Active */}
          <button
            onClick={() => {
              setActiveTab("active")
              setStatusFilter("All")
              setCategoryFilter("All")
              setPriorityFilter("All")
              setSearchQuery("")
            }}
            className={cn(
              "group flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200",
              activeTab === "active"
                ? "border-[#1e4fa3] bg-[#e8f0ff] text-[#1e4fa3] shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-[#1e4fa3]/30 hover:bg-muted hover:text-foreground"
            )}
          >
            <FolderOpen className="h-4 w-4" />
            <span>Active</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                activeTab === "active"
                  ? "bg-[#1e4fa3] text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {activeCount}
            </span>
          </button>

          {/* Archive */}
          <button
            onClick={() => {
              setActiveTab("archive")
              setStatusFilter("All")
              setCategoryFilter("All")
              setPriorityFilter("All")
              setSearchQuery("")
            }}
            className={cn(
              "group flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200",
              activeTab === "archive"
                ? "border-[#1e4fa3] bg-[#e8f0ff] text-[#1e4fa3] shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-[#1e4fa3]/30 hover:bg-muted hover:text-foreground"
            )}
          >
            <Archive className="h-4 w-4" />
            <span>Archive</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                activeTab === "archive"
                  ? "bg-[#1e4fa3] text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {archiveCount}
            </span>
          </button>
        </div>

        {/* RIGHT SIDE: Sort */}
        <div className="ml-auto flex items-center">
          <button
            onClick={() => {
              setSortBy((prev) =>
                prev === "Newest"
                  ? "Oldest"
                  : prev === "Oldest"
                  ? "Priority"
                  : "Newest"
              )
            }}
            className={cn(
              "group flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200",
              "border-border bg-card text-muted-foreground hover:border-[#1e4fa3]/30 hover:bg-muted hover:text-foreground"
            )}
          >
            {/* Icon */}
            {sortBy === "Newest" && <ArrowUpDown className="h-4 w-4" />}
            {sortBy === "Oldest" && <ArrowUpDown className="h-4 w-4" />}
            {sortBy === "Priority" && <ArrowUpDown className="h-4 w-4" />}

            {/* Label */}
            <span>{sortBy}</span>
          </button>
        </div>
      </div>

      <div className="relative mb-2">

        <Search className="absolute left-2 sm:left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2 sm:py-2.5 pl-8 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-card-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="mb-5 flex items-center gap-2 overflow-x-auto border-b border-border pb-3">
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "All" | CaseStatus)}>
          <SelectTrigger className="w-32 sm:w-[140px] rounded-lg border border-[var(--iris-border)] bg-[var(--iris-surface)] px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-[var(--iris-text)] outline-none transition-colors duration-200 shrink-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--iris-surface)] border-[var(--iris-border)]">
            {allStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "All" ? "All Statuses" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as "All" | CaseCategory)}>
          <SelectTrigger className="w-36 sm:w-[160px] rounded-lg border border-[var(--iris-border)] bg-[var(--iris-surface)] px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-[var(--iris-text)] outline-none transition-colors duration-200 shrink-0">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--iris-surface)] border-[var(--iris-border)]">
            {allCategories.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "All" ? "All Categories" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as "All" | CasePriority)}>
          <SelectTrigger className="w-32 sm:w-[140px] rounded-lg border border-[var(--iris-border)] bg-[var(--iris-surface)] px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-[var(--iris-text)] outline-none transition-colors duration-200 shrink-0">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--iris-surface)] border-[var(--iris-border)]">
            {allPriorities.map((p) => (
              <SelectItem key={p} value={p}>
                {p === "All" ? "All Priorities" : p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loadError && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoadingCases && Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-[220px] animate-pulse rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
              <div className="h-8 w-8 rounded-lg bg-muted" />
            </div>
            <div className="mt-5 space-y-2">
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-3/4 rounded bg-muted" />
            </div>
            <div className="mt-5 flex gap-2">
              <div className="h-6 w-14 rounded-full bg-muted" />
              <div className="h-6 w-24 rounded-full bg-muted" />
            </div>
            <div className="my-5 h-px bg-muted" />
            <div className="h-3 w-36 rounded bg-muted" />
          </div>
        ))}

        {!isLoadingCases && cases.map((caseItem) => (
          <div
            key={caseItem.id}
            onClick={() =>
              router.push(`/cases/case-details/${encodeURIComponent(caseItem.id)}`)
            }
            className={cn(
              "group relative cursor-pointer overflow-visible rounded-2xl border bg-card p-5 shadow-sm",
              "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg",

              // subtle priority border styling
              caseItem.priority === "High" &&
                "border-red-200 hover:border-red-300 dark:border-red-900/40",

              caseItem.priority === "Medium" &&
                "border-yellow-200 hover:border-yellow-300 dark:border-yellow-900/40",

              caseItem.priority === "Low" &&
                "border-green-200 hover:border-green-300 dark:border-green-900/40",

              "hover:border-primary/30"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
                  {caseItem.fullName?.trim() || caseItem.shortName}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {caseItem.date}
                </p>
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
                  mode={activeTab === "archive" ? "archive" : "default"}
                />
              </div>
            </div>

            {/* Description */}
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-card-foreground">
              {caseItem.details}
            </p>

            {/* Category */}
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              {caseItem.category}
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

              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                  statusStyles[caseItem.status]
                )}
              >
                {caseItem.status}
              </span>
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

      {!isLoadingCases && cases.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          <p className="text-sm font-semibold">No cases found</p>
          <p className="mt-1 text-xs">Try changing the tab, filter, or search term.</p>
        </div>
      )}

      {!isLoadingCases && pagination.totalPages > 1 && (
        <div className="mt-5 flex flex-col gap-2 border-t pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Page {pagination.page} of {pagination.totalPages} - {pagination.total} cases
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={pagination.page <= 1}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))} disabled={pagination.page >= pagination.totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{pendingAction ? actionTitles[pendingAction.action] : "Case Action"}</DialogTitle>
            <DialogDescription>
              {pendingAction?.caseItem.caseNumber} - {pendingAction?.caseItem.fullName}
            </DialogDescription>
          </DialogHeader>

          {pendingAction?.action === "assign" ? (
            <div className="grid gap-2">
              <Label htmlFor="case-officer">Officer</Label>
              <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                <SelectTrigger id="case-officer" className="w-full bg-background">
                  <SelectValue placeholder="Select officer" />
                </SelectTrigger>
                <SelectContent>
                  {officers.filter((officer) => officer !== "Unassigned").map((officer) => (
                    <SelectItem key={officer} value={officer}>
                      {officer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : pendingAction?.action === "mediation" ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="hearing-mediator">Mediator</Label>
                <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                  <SelectTrigger id="hearing-mediator" className="w-full bg-background">
                    <SelectValue placeholder="Select mediator" />
                  </SelectTrigger>
                  <SelectContent>
                    {officers.filter((officer) => officer !== "Unassigned").map((officer) => (
                      <SelectItem key={officer} value={officer}>
                        {officer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="hearing-date">Hearing date</Label>
                  <input
                    id="hearing-date"
                    type="date"
                    min={today}
                    value={mediationDate}
                    onChange={(event) => setMediationDate(event.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hearing-time">Hearing time</Label>
                  <input
                    id="hearing-time"
                    type="time"
                    value={mediationTime}
                    onChange={(event) => setMediationTime(event.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hearing-location">Location</Label>
                <input
                  id="hearing-location"
                  value={mediationLocation}
                  onChange={(event) => setMediationLocation(event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {pendingAction?.action === "verify" && "This will move the case into Under Review."}
              {pendingAction?.action === "resolve" && "This will move the case into the resolved archive."}
              {pendingAction?.action === "close" && "This will close the case and move it into the archive."}
              {pendingAction?.action === "restore" && "This will move the case back to Under Review."}
              {pendingAction?.action === "delete" && "This will permanently delete the case record."}
            </p>
          )}

          {actionError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {actionError}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingAction(null)} disabled={isSubmittingAction}>
              Cancel
            </Button>
            <Button onClick={confirmAction} disabled={isSubmittingAction} variant={pendingAction?.action === "delete" ? "destructive" : "default"}>
              {isSubmittingAction ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
