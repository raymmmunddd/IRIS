"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
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

const avatarColors: Record<string, string> = {
  high: "bg-[#1e3a5f] text-[#60a5fa]",
  medium: "bg-[#2d4a3d] text-[#4ade80]",
  low: "bg-[#3d2d2d] text-[#f87171]",
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
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active")
  const [statusFilter, setStatusFilter] = useState<"All" | CaseStatus>("All")
  const [categoryFilter, setCategoryFilter] = useState<"All" | CaseCategory>("All")
  const [priorityFilter, setPriorityFilter] = useState<"All" | CasePriority>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [openActionId, setOpenActionId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [cases, setCases] = useState<CaseRecord[]>([])
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

  // Load cases from storage when filters change to keep in sync with persisted data
  const filtered = useMemo(() => {
    const sourceCases = cases.filter((caseItem) => {
      const archived = caseItem.status === "Resolved" || caseItem.status === "Closed"
      return activeTab === "archive" ? archived : !archived
    })

    return sourceCases.filter((c) => {
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
  }, [cases, statusFilter, categoryFilter, priorityFilter, searchQuery, activeTab, refreshTrigger])

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

  return (
    <>
      <div className="mb-4 sm:mb-5 flex border-b border-border overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab("active")
            setStatusFilter("All")
            setCategoryFilter("All")
            setPriorityFilter("All")
            setSearchQuery("")
          }}
          className={cn(
            "relative px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors shrink-0",
            activeTab === "active"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Active Cases
          {activeTab === "active" && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab("archive")
            setStatusFilter("All")
            setCategoryFilter("All")
            setPriorityFilter("All")
            setSearchQuery("")
          }}
          className={cn(
            "relative px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors shrink-0",
            activeTab === "archive"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Archive
          {activeTab === "archive" && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      <div className="relative mb-4 sm:mb-5">
        <Search className="absolute left-2 sm:left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2 sm:py-2.5 pl-8 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-card-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="mb-4 sm:mb-5 flex items-center gap-2 overflow-x-auto pb-2">
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "All" | CaseStatus)}>
          <SelectTrigger className="w-32 sm:w-[140px] rounded-lg border border-[var(--iris-border)] bg-[var(--iris-surface)] px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-[var(--iris-text)] outline-none transition-colors duration-200 focus:ring-1 focus:ring-[#16a34a] shrink-0">
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
          <SelectTrigger className="w-36 sm:w-[160px] rounded-lg border border-[var(--iris-border)] bg-[var(--iris-surface)] px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-[var(--iris-text)] outline-none transition-colors duration-200 focus:ring-1 focus:ring-[#16a34a] shrink-0">
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
          <SelectTrigger className="w-32 sm:w-[140px] rounded-lg border border-[var(--iris-border)] bg-[var(--iris-surface)] px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-[var(--iris-text)] outline-none transition-colors duration-200 focus:ring-1 focus:ring-[#16a34a] shrink-0">
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

      <div className="overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-foreground">Name</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-foreground">Category</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-foreground">Priority</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-foreground">Status</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-foreground">Officer</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-foreground">Date</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((caseItem) => (
                <tr
                  key={caseItem.id}
                  onClick={() => router.push(`/cases/case-details/${encodeURIComponent(caseItem.id)}`)}
                  className="cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/30 last:border-0"
                >
                  <td className="px-2 sm:px-4 py-2 sm:py-3.5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={cn("flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold", getAvatarColor(caseItem.priority))}>
                        {caseItem.fullName.charAt(0)}
                      </div>
                      <span className="font-medium text-card-foreground line-clamp-1">{caseItem.shortName}</span>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3.5 text-muted-foreground text-[10px] sm:text-sm line-clamp-1">{caseItem.category}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium", priorityColors[caseItem.priority])}>
                      {caseItem.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn(
                      "inline-flex rounded-md px-2.5 py-1 text-xs font-medium",
                      statusStyles[caseItem.status],
                    )}>
                      {caseItem.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{caseItem.assignedOfficer}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{caseItem.date}</td>
                  <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <CaseActionDropdown
                      isOpen={openActionId === caseItem.id}
                      onToggle={() => setOpenActionId(openActionId === caseItem.id ? null : caseItem.id)}
                      onClose={() => setOpenActionId(null)}
                      onAction={(action) => handleAction(action, caseItem)}
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    No cases found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
