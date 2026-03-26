"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import type { CaseRecord, CaseStatus, CaseCategory, CasePriority } from "@/lib/types"
import { getActiveCases, getArchivedCases } from "@/lib/caseStorage"
import { CaseActionDropdown } from "./case-action-dropdown"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

export function CasesTable() {
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active")
  const [statusFilter, setStatusFilter] = useState<"All" | CaseStatus>("All")
  const [categoryFilter, setCategoryFilter] = useState<"All" | CaseCategory>("All")
  const [priorityFilter, setPriorityFilter] = useState<"All" | CasePriority>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [openActionId, setOpenActionId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const router = useRouter()

  // Refresh helper to reload from storage after updates
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  // Load cases from storage when filters change to keep in sync with persisted data
  const filtered = useMemo(() => {
    const sourceCases = activeTab === "active" ? getActiveCases() : getArchivedCases()

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
  }, [statusFilter, categoryFilter, priorityFilter, searchQuery, activeTab, refreshTrigger])

  useEffect(() => {
    // trigger initial load
    handleRefresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleAction(action: string, caseItem: CaseRecord) {
    const labels: Record<string, string> = {
      verify: "Verified",
      assign: "Assign Officer triggered for",
      mediation: "Mediation scheduled for",
      resolve: "Marked as Resolved:",
      close: "Case closed:",
    }
    alert(`${labels[action] || action} ${caseItem.caseNumber} - ${caseItem.fullName}`)
  }

  const getAvatarColor = (priority: CasePriority) => {
    // Return a default background if needed, but styling is handled by priorityColors now
    return "bg-muted text-muted-foreground"
  }

  return (
    <>
      <div className="mb-5 flex border-b border-border">
        <button
          onClick={() => {
            setActiveTab("active")
            setStatusFilter("All")
            setCategoryFilter("All")
            setPriorityFilter("All")
            setSearchQuery("")
          }}
          className={cn(
            "relative px-4 py-3 text-sm font-medium transition-colors",
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
            "relative px-4 py-3 text-sm font-medium transition-colors",
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

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, case number, or officer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="mb-5 flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "All" | CaseStatus)}>
          <SelectTrigger className="w-[140px] rounded-lg border border-[var(--iris-border)] bg-[var(--iris-surface)] px-3 py-1.5 text-xs font-medium text-[var(--iris-text)] outline-none transition-colors duration-200 focus:ring-1 focus:ring-[#16a34a]">
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
          <SelectTrigger className="w-[160px] rounded-lg border border-[var(--iris-border)] bg-[var(--iris-surface)] px-3 py-1.5 text-xs font-medium text-[var(--iris-text)] outline-none transition-colors duration-200 focus:ring-1 focus:ring-[#16a34a]">
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
          <SelectTrigger className="w-[140px] rounded-lg border border-[var(--iris-border)] bg-[var(--iris-surface)] px-3 py-1.5 text-xs font-medium text-[var(--iris-text)] outline-none transition-colors duration-200 focus:ring-1 focus:ring-[#16a34a]">
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Priority</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Assigned Officer</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Date</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((caseItem) => (
                <tr
                  key={caseItem.id}
                  onClick={() => router.push(`/cases/case-details/${encodeURIComponent(caseItem.id)}`)}
                  className="cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/30 last:border-0"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold", getAvatarColor(caseItem.priority))}>
                        {caseItem.fullName.charAt(0)}
                      </div>
                      <span className="font-medium text-card-foreground">{caseItem.shortName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{caseItem.category}</td>
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
    </>
  )
}
