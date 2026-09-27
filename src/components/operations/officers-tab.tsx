"use client"

import * as React from "react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  Users,
  FileText,
  TrendingUp,
  Eye,
  UserPlus,
  Search,
  ChevronRight,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { ListPagination } from "@/components/ui/list-pagination"
import { paginateItems } from "@/lib/pagination"

export type OperationsOfficer = {
  id: string
  name: string
  fullName: string
  position: string
  activeCases: number
  resolvedCases: number
  cases?: {
    id: string
    caseNumber: string
    title: string
    status: string
    priority: string
  }[]
}

export type AssignableCase = {
  id: string
  caseNumber: string
  title: string
  status: string
}

interface InsightCardProps {
  title: string
  value: string
  description: string
  state: "normal" | "warning" | "critical" | "positive"
  icon: React.ReactNode
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function getWorkloadTone(activeCases: number) {
  if (activeCases <= 3) {
    return {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      label: "Light",
    }
  }
  if (activeCases <= 6) {
    return {
      badge: "border-amber-200 bg-amber-50 text-amber-700",
      label: "Moderate",
    }
  }
  return {
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    label: "Heavy",
  }
}

function getCasePriorityTone(priority: string) {
  const normalized = priority.toLowerCase()

  if (normalized.includes("high")) {
    return "border-rose-200 bg-rose-50 text-rose-700"
  }
  if (normalized.includes("medium")) {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }
  return "border-sky-200 bg-sky-50 text-sky-700"
}

function getCaseStatusTone(status: string) {
  const normalized = status.toLowerCase()

  if (normalized.includes("resolved") || normalized.includes("closed")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }
  if (normalized.includes("dismissed")) {
    return "border-slate-200 bg-slate-100 text-slate-600"
  }
  if (normalized.includes("mediation")) {
    return "border-violet-200 bg-violet-50 text-violet-700"
  }
  if (normalized.includes("under review")) {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }
  return "border-sky-200 bg-sky-50 text-sky-700"
}

function InsightTile({
  title,
  value,
  description,
  state,
  icon,
}: InsightCardProps) {
  const styles = {
    normal: {
      card: "border-slate-200/80 bg-white/90",
      icon: "bg-slate-100 text-slate-700",
      badge: "bg-slate-100 text-slate-800",
    },
    positive: {
      card: "border-emerald-200/80 bg-emerald-50/40",
      icon: "bg-emerald-100 text-emerald-700",
      badge: "bg-emerald-100 text-emerald-700",
    },
    warning: {
      card: "border-amber-200/80 bg-amber-50/50",
      icon: "bg-amber-100 text-amber-700",
      badge: "bg-amber-100 text-amber-700",
    },
    critical: {
      card: "border-rose-200/80 bg-rose-50/50",
      icon: "bg-rose-100 text-rose-700",
      badge: "bg-rose-100 text-rose-700",
    },
  }[state]

  return (
    <div
      className={cn(
        "rounded-3xl border p-5 shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        styles.card
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-wide text-slate-600">
            {title}
          </p>

          <div
            className={cn(
              "inline-flex rounded-2xl px-3 py-1.5 text-lg font-bold",
              styles.badge
            )}
          >
            {value}
          </div>

          <p className="text-sm leading-relaxed text-slate-600">
            {description}
          </p>
        </div>

        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            styles.icon
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

interface OfficersTabProps {
  officers?: OperationsOfficer[]
  assignableCases?: AssignableCase[]
  onUpdated?: () => void
}

export function OfficersTab({
  officers = [],
  assignableCases = [],
  onUpdated,
}: OfficersTabProps) {
  const [selectedOfficer, setSelectedOfficer] = useState<OperationsOfficer | null>(null)
  const [assignOfficer, setAssignOfficer] = useState<OperationsOfficer | null>(null)
  const currentSelectedOfficer = selectedOfficer
    ? officers.find((officer) => officer.id === selectedOfficer.id) ?? selectedOfficer
    : null
  const [selectedCaseId, setSelectedCaseId] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [lastName, setLastName] = useState("")
  const [suffix, setSuffix] = useState("")
  const fullName = [
    firstName,
    middleName,
    lastName,
    suffix,
  ]
  .filter(Boolean)
  .join(" ")
  const [email, setEmail] = useState("")
  const [roleTitle, setRoleTitle] = useState("BPAT_OFFICER")
  const [search, setSearch] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const totalOfficers = officers.length
  const totalActiveCases = officers.reduce((sum, o) => sum + o.activeCases, 0)
  const totalResolvedCases = officers.reduce((sum, o) => sum + o.resolvedCases, 0)

  const filteredOfficers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return officers

    return officers.filter((officer) => {
      const haystack = [
        officer.fullName,
        officer.name,
        officer.position,
        String(officer.activeCases),
        String(officer.resolvedCases),
      ]
        .join(" ")
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [officers, search])

  const pageSize = 5
  const { page: visiblePage, pageCount, items: visibleOfficers } = paginateItems(filteredOfficers, currentPage, pageSize)

  async function addOfficer() {
    if (!fullName || !email) {
      toast.error("Name and email are required")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/operations/officers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, roleTitle }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to add officer")
      toast.success("Officer added")
      setFirstName("")
      setMiddleName("")
      setLastName("")
      setSuffix("")
      setEmail("")
      setRoleTitle("BPAT_OFFICER")
      setIsAddOpen(false)
      onUpdated?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add officer")
    } finally {
      setIsSaving(false)
    }
  }

  async function assignCase() {
    if (!assignOfficer || !selectedCaseId) {
      toast.error("Select a case first")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/operations/assign-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officerId: assignOfficer.id, caseId: selectedCaseId }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to assign case")
      toast.success("Case assigned")
      setAssignOfficer(null)
      setSelectedCaseId("")
      onUpdated?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to assign case")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <InsightTile
          title="Active Officers"
          value={`${totalOfficers}`}
          description="Lupon members currently available for deployment."
          state="normal"
          icon={<Users className="h-6 w-6" />}
        />

        <InsightTile
          title="Open Case Assignments"
          value={`${totalActiveCases}`}
          description="Cases currently assigned to officers."
          state={
            totalActiveCases > totalOfficers * 5 ? "critical" : "warning"
          }
          icon={<FileText className="h-6 w-6" />}
        />

        <InsightTile
          title="Cases Resolved"
          value={`${totalResolvedCases}`}
          description="Successfully resolved by Lupon officers."
          state="positive"
          icon={<TrendingUp className="h-6 w-6" />}
        />

      </div>

      <Card className="rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <CardHeader className="px-6 py-2">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Lupon Members
              </CardTitle>

              <p className="text-sm text-slate-500">
                Manage member workload and case assignments.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                  placeholder="Search officers..."
                  className="
                    h-11 rounded-2xl border-slate-200 bg-white pl-9
                    text-slate-900 placeholder:text-slate-400
                    shadow-sm outline-none
                    focus-visible:border-[#D9A900]
                    focus-visible:ring-2 focus-visible:ring-[#D9A900]/20
                  "
                />
              </div>

              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="
                      h-11 rounded-2xl px-4
                      bg-[#1E3A5F] text-white shadow-sm
                      hover:bg-[#162C48]
                      gap-2
                    "
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Member
                  </Button>
                </DialogTrigger>

                <DialogContent className="rounded-3xl border-slate-200 bg-white shadow-xl sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-slate-900">
                      Add Member
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label
                        htmlFor="officer-name"
                        className="text-sm font-medium text-slate-700"
                      >
                        Full name
                      </Label>
                      <Input
                        id="officer-name"
                        value={fullName}
                        onChange={(event) => setFirstName(event.target.value)}
                        className="
                          h-11 rounded-2xl border-slate-200 bg-white
                          focus-visible:border-[#D9A900]
                          focus-visible:ring-2 focus-visible:ring-[#D9A900]/20
                        "
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label
                        htmlFor="officer-email"
                        className="text-sm font-medium text-slate-700"
                      >
                        Email
                      </Label>
                      <Input
                        id="officer-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="
                          h-11 rounded-2xl border-slate-200 bg-white
                          focus-visible:border-[#D9A900]
                          focus-visible:ring-2 focus-visible:ring-[#D9A900]/20
                        "
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Role
                      </Label>
                      <Select value={roleTitle} onValueChange={setRoleTitle}>
                        <SelectTrigger
                          className="
                            h-11 rounded-2xl border-slate-200 bg-white
                            focus:ring-2 focus:ring-[#D9A900]/20
                          "
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-200 bg-white">
                          <SelectItem value="BPAT_OFFICER">
                            Lupon Chairman
                          </SelectItem>
                          <SelectItem value="LUPON_MEMBER">
                            Lupon Member
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsAddOpen(false)}
                        disabled={isSaving}
                        className="
                          h-11 rounded-2xl px-4
                          text-slate-600 hover:bg-slate-100 hover:text-slate-900
                        "
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={addOfficer}
                        disabled={isSaving}
                        className="
                          h-11 rounded-2xl px-5
                          bg-[#D9A900] text-slate-950 shadow-sm
                          hover:bg-[#B88900]
                        "
                      >
                        {isSaving ? "Saving..." : "Save Officer"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-1">
          <div className="space-y-4">
            {filteredOfficers.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Users className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  No officers found.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try adjusting your search.
                </p>
              </div>
            )}

            {visibleOfficers.map((officer) => {
              const workloadTone = getWorkloadTone(officer.activeCases)

              return (
                <div
                  key={officer.id}
                  className="
                    group rounded-3xl border border-slate-200/80 bg-white
                    p-5 shadow-sm transition-all duration-200
                    hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md
                  "
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <Avatar className="h-14 w-14 border border-slate-200 bg-slate-50">
                        <AvatarFallback className="bg-slate-100 text-sm font-semibold text-slate-700">
                          {getInitials(officer.fullName || officer.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-lg font-semibold text-slate-900">
                            {officer.fullName}
                          </h3>

                          <Badge
                            className="
                              rounded-full border border-slate-200
                              bg-slate-50 px-2.5 py-1 text-[11px]
                              font-medium text-slate-600
                            "
                          >
                            {officer.position}
                          </Badge>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          Lupon members profile and current workload summary.
                        </p>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                            <FileText className="h-4 w-4 text-slate-500" />
                            <span className="text-sm text-slate-600">
                              <span className="font-semibold text-slate-900">
                                {officer.activeCases}
                              </span>{" "}
                              active
                            </span>
                          </div>

                          <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                            <TrendingUp className="h-4 w-4 text-slate-500" />
                            <span className="text-sm text-slate-600">
                              <span className="font-semibold text-slate-900">
                                {officer.resolvedCases}
                              </span>{" "}
                              resolved
                            </span>
                          </div>

                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 lg:items-end">
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <Badge
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium",
                            workloadTone.badge
                          )}
                        >
                          {workloadTone.label} workload
                        </Badge>
                      </div>


                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOfficer(officer)}
                          className="
                            h-11 rounded-2xl border-slate-200
                            bg-white px-4 text-slate-700 shadow-sm
                            hover:border-[#D9A900]/40 hover:bg-[#FFF4C7]/40
                            hover:text-slate-950
                            gap-2
                          "
                        >
                          <Eye className="h-4 w-4" />
                          View Cases
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => setAssignOfficer(officer)}
                          className="
                            h-11 rounded-2xl bg-[#1E3A5F]
                            px-4 text-white shadow-sm
                            hover:bg-[#162C48]
                            gap-2
                          "
                        >
                          Assign Case
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <ListPagination
            page={visiblePage}
            pageCount={pageCount}
            pageSize={pageSize}
            totalItems={filteredOfficers.length}
            itemLabel="officers"
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedOfficer}
        onOpenChange={(open) => !open && setSelectedOfficer(null)}
      >
        <DialogContent className="flex max-h-[85dvh] min-h-0 flex-col overflow-hidden rounded-3xl border-slate-200 bg-white shadow-xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              {currentSelectedOfficer?.fullName} Cases
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 space-y-3 overflow-y-auto overscroll-contain pr-1">
            {currentSelectedOfficer?.cases?.length ? (
              currentSelectedOfficer.cases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="
                    rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4
                    transition-colors hover:bg-slate-50
                  "
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {caseItem.caseNumber}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {caseItem.title}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium",
                          getCaseStatusTone(caseItem.status)
                        )}
                      >
                        {caseItem.status}
                      </Badge>
                      <Badge
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium",
                          getCasePriorityTone(caseItem.priority)
                        )}
                      >
                        {caseItem.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 py-10 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No cases assigned.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  This member currently has no open or active assignments.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!assignOfficer}
        onOpenChange={(open) => !open && setAssignOfficer(null)}
      >
        <DialogContent className="rounded-3xl border-slate-200 bg-white shadow-xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              Assign Case to {assignOfficer?.fullName}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label className="text-sm font-medium text-slate-700">
                Select case
              </Label>
              <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                <SelectTrigger
                  className="
                    h-11 rounded-2xl border-slate-200 bg-white
                    focus:ring-2 focus:ring-[#D9A900]/20
                  "
                >
                  <SelectValue placeholder="Choose a case" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 bg-white">
                  {assignableCases.map((caseItem) => (
                    <SelectItem key={caseItem.id} value={caseItem.id}>
                      {caseItem.caseNumber} - {caseItem.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAssignOfficer(null)}
                disabled={isSaving}
                className="
                  h-11 rounded-2xl px-4
                  text-slate-600 hover:bg-slate-100 hover:text-slate-900
                "
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={assignCase}
                disabled={isSaving}
                className="
                  h-11 rounded-2xl bg-[#D9A900] px-5
                  text-slate-950 shadow-sm
                  hover:bg-[#B88900]
                "
              >
                {isSaving ? "Assigning..." : "Assign Case"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
