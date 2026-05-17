"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Archive, Clock3, FolderOpen  } from "lucide-react"
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
import { ArrowUpDown, ArrowUp, ArrowDown, TriangleAlert } from "lucide-react"

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

const categoryMeta = [
  { key: "violence", name: "Violence or Threats", shortName: "Violence/Threats", color: "#d64545" },
  { key: "harassment", name: "Harassment & Abuse", shortName: "Harassment", color: "#d99e04" },
  { key: "fraud", name: "Fraud & Scams", shortName: "Fraud/Scams", color: "#f2b705" },
  { key: "disturbance", name: "Public Disturbance", shortName: "Public Disturb.", color: "#0ea5e9" },
  { key: "property", name: "Property & Theft", shortName: "Property/Theft", color: "#1e4fa3" },
  { key: "community", name: "Community Dispute", shortName: "Community Disp.", color: "#7c3aed" },
  { key: "child", name: "Child & Vulnerable", shortName: "Child/Vulnerable", color: "#8b5cf6" },
]

const getCategoryMeta = (category: string) => {
  return (
    categoryMeta.find((c) =>
      category.toLowerCase().includes(c.name.toLowerCase())
    ) || categoryMeta[0]
  )
}

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  "Under Review": "bg-blue-100 text-blue-700 border border-blue-200",
  Mediation: "bg-purple-100 text-purple-700 border border-purple-200",
  Resolved: "bg-green-100 text-green-700 border border-green-200",
  Closed: "bg-slate-100 text-slate-600 border border-slate-200",
}

const avatarColors: Record<string, string> = {
  high: "bg-[#1e3a5f] text-[#60a5fa]",
  medium: "bg-[#2d4a3d] text-[#4ade80]",
  low: "bg-[#3d2d2d] text-[#f87171]",
}

const priorityWeight: Record<string, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
}

type CaseAction = "verify" | "assign" | "mediation" | "resolve" | "close"

const actionTitles: Record<CaseAction, string> = {
  verify: "Verify Case",
  assign: "Assign Officer",
  mediation: "Move to Mediation",
  resolve: "Resolve Case",
  close: "Close Case",
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
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [cases, setCases] = useState<CaseRecord[]>([])
  const [sortBy, setSortBy] = useState<"Newest" | "Oldest" | "Priority">("Newest")
  const [officers, setOfficers] = useState<string[]>(["Unassigned"])
  const [pendingAction, setPendingAction] = useState<{ action: CaseAction; caseItem: CaseRecord } | null>(null)
  const [selectedOfficer, setSelectedOfficer] = useState("")
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)
  const [actionError, setActionError] = useState("")
  const router = useRouter()

  // Refresh helper to reload from storage after updates
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  async function loadCases() {
    try {
      const response = await fetch("/api/cases")
      const result = await response.json()
      if (result.success) setCases(result.data)
    } catch (error) {
      console.error("Failed to load cases:", error)
    }
  }

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

  const filtered = useMemo(() => {
    const sourceCases = cases.filter((caseItem) => {
      const archived =
        caseItem.status === "Resolved" ||
        caseItem.status === "Closed"

      const pending = caseItem.status === "Pending"

      if (activeTab === "pending") return pending
      if (activeTab === "archive") return archived

      return !pending && !archived
    })

    let result = sourceCases.filter((c) => {
      if (statusFilter !== "All" && c.status !== statusFilter) return false
      if (categoryFilter !== "All" && c.category !== categoryFilter) return false
      if (priorityFilter !== "All" && c.priority !== priorityFilter) return false

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          c.fullName.toLowerCase().includes(q) ||
          c.shortName.toLowerCase().includes(q) ||
          c.caseNumber.toLowerCase().includes(q) ||
          c.assignedOfficer.toLowerCase().includes(q)
        )
      }

      return true
    })

    result = [...result].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()

      if (sortBy === "Newest") return dateB - dateA
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
    statusFilter,
    categoryFilter,
    priorityFilter,
    searchQuery,
    activeTab,
    refreshTrigger,
    sortBy
  ])

  useEffect(() => {
    loadCases()
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

  function handleAction(action: string, caseItem: CaseRecord) {
    const nextAction = action as CaseAction
    const assignableOfficers = officers.filter((officer) => officer !== "Unassigned")
    setActionError("")
    setSelectedOfficer(
      caseItem.assignedOfficer !== "Unassigned" ? caseItem.assignedOfficer : assignableOfficers[0] ?? "",
    )
    setPendingAction({ action: nextAction, caseItem })
    setOpenActionId(null)
  }

  async function confirmAction() {
    if (!pendingAction) return

    const { action, caseItem } = pendingAction
    const input: { status?: CaseStatus; assignedOfficer?: string } = {}

    if (action === "verify") input.status = "Under Review"
    if (action === "assign") {
      if (!selectedOfficer) {
        setActionError("Select an officer before assigning this case.")
        return
      }
      input.assignedOfficer = selectedOfficer
    }
    if (action === "mediation") input.status = "Mediation"
    if (action === "resolve") input.status = "Resolved"
    if (action === "close") input.status = "Closed"

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
    // Return a default background if needed, but styling is handled by priorityColors now
    return "bg-muted text-muted-foreground"
  }

  const pendingCount = cases.filter(
    (c) => c.status === "Pending"
  ).length

  const archiveCount = cases.filter(
    (c) => c.status === "Resolved" || c.status === "Closed"
  ).length

  const activeCount = cases.filter(
    (c) =>
      c.status !== "Pending" &&
      c.status !== "Resolved" &&
      c.status !== "Closed"
  ).length

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

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((caseItem) => (
          <div
            key={caseItem.id}
            onClick={() =>
              router.push(`/cases/case-details/${encodeURIComponent(caseItem.id)}`)
            }
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-2xl border bg-card p-5 shadow-sm",
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

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          No cases found matching your filters.
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
          ) : (
            <p className="text-sm text-muted-foreground">
              {pendingAction?.action === "verify" && "This will move the case into Under Review."}
              {pendingAction?.action === "mediation" && "This will mark the case for mediation handling."}
              {pendingAction?.action === "resolve" && "This will move the case into the resolved archive."}
              {pendingAction?.action === "close" && "This will close the case and move it into the archive."}
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
            <Button onClick={confirmAction} disabled={isSubmittingAction}>
              {isSubmittingAction ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}