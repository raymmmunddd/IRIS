"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Users,
  FileText,
  TrendingUp,
  Award,
  TrendingDown, // Added for consistency if needed, though officer logic might use Up
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { cn } from "@/lib/utils"

export type OperationsOfficer = {
  id: string
  name: string
  fullName: string
  position: string
  activeCases: number
  resolvedCases: number
  performance: number
  avgResponseTime: string
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

// Replicated StatCard for Operations Tab to ensure matching design
interface StatCardProps {
  title: string
  value: string | number
  period?: string
  change?: number
  trending?: "up" | "down"
  icon: React.ReactNode
  iconBg: string
  accentClass?: string
}

function StatCard({ title, value, period, change, trending, icon, iconBg, accentClass }: StatCardProps) {
  const isUp = trending === "up"
  
  return (
    <div className={cn("flex items-center gap-4 rounded-xl border px-4 py-3.5", "border-border bg-card shadow-sm")}>
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 shadow-sm", iconBg)}>
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-xs font-semibold text-[var(--foreground)]/80">{title}</p>
        <p className="text-xl font-bold leading-tight text-[var(--foreground)]">{value}</p>
        <div className="flex items-center gap-2 text-[11px]">
          {period && <span className="text-[var(--foreground)]/70">{period}</span>}
          {change !== undefined && (
             <span className={cn("flex items-center gap-0.5 font-semibold", isUp ? "text-emerald-600" : "text-red-500", accentClass)}>
             {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
             {change}%
           </span>
          )}
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

export function OfficersTab({ officers = [], assignableCases = [], onUpdated }: OfficersTabProps) {
  const [selectedOfficer, setSelectedOfficer] = useState<OperationsOfficer | null>(null)
  const [assignOfficer, setAssignOfficer] = useState<OperationsOfficer | null>(null)
  const [selectedCaseId, setSelectedCaseId] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [roleTitle, setRoleTitle] = useState("BPAT_OFFICER")
  const totalOfficers = officers.length
  const totalActiveCases = officers.reduce((sum, o) => sum + o.activeCases, 0)
  const totalResolvedCases = officers.reduce((sum, o) => sum + o.resolvedCases, 0)
  const avgPerformance = Math.round(
    officers.reduce((sum, o) => sum + o.performance, 0) / Math.max(totalOfficers, 1)
  )

  async function addOfficer() {
    if (!fullName || !email) {
      toast.error("Name and email are required")
      return
    }

    const response = await fetch("/api/operations/officers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, roleTitle }),
    })
    const result = await response.json()
    if (!result.success) {
      toast.error(result.message || "Unable to add officer")
      return
    }

    toast.success("Officer added")
    setFullName("")
    setEmail("")
    setRoleTitle("BPAT_OFFICER")
    setIsAddOpen(false)
    onUpdated?.()
  }

  async function assignCase() {
    if (!assignOfficer || !selectedCaseId) {
      toast.error("Select a case first")
      return
    }

    const response = await fetch("/api/operations/assign-case", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ officerId: assignOfficer.id, caseId: selectedCaseId }),
    })
    const result = await response.json()
    if (!result.success) {
      toast.error(result.message || "Unable to assign case")
      return
    }

    toast.success("Case assigned")
    setAssignOfficer(null)
    setSelectedCaseId("")
    onUpdated?.()
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards - Updated Design */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
            title="Total Officers"
            value={totalOfficers}
            period="Active"
            change={5}
            trending="up"
            icon={<Users className="h-4 w-4" />}
            iconBg="bg-blue-600 text-white"
        />
        <StatCard
            title="Active Cases"
            value={totalActiveCases}
            period="Currently Open"
            change={12}
            trending="up" // Up usually bad for cases, but let's stick to design pattern
            icon={<FileText className="h-4 w-4" />}
            iconBg="bg-orange-500 text-white"
        />
        <StatCard
            title="Resolved Cases"
            value={totalResolvedCases}
            period="This Month"
            change={8}
            trending="up"
            icon={<TrendingUp className="h-4 w-4" />}
            iconBg="bg-emerald-600 text-white"
        />
        <StatCard
            title="Avg Performance"
            value={`${avgPerformance}%`}
            period="Team Average"
            change={2.5}
            trending="up"
            icon={<Award className="h-4 w-4" />}
            iconBg="bg-purple-600 text-white"
        />
      </div>

      {/* Officers List */}
      <Card className="col-span-4 rounded-xl border border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-semibold">BPAT Members</CardTitle>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-black hover:bg-black/90 text-white gap-2">
                <Users className="h-4 w-4" />
                Add Officer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Officer</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="officer-name">Full name</Label>
                  <Input id="officer-name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="officer-email">Email</Label>
                  <Input id="officer-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <Select value={roleTitle} onValueChange={setRoleTitle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BPAT_OFFICER">BPAT Officer</SelectItem>
                      <SelectItem value="LUPON_MEMBER">Lupon Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addOfficer} className="bg-black text-white hover:bg-black/90">Save Officer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {officers.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No officers found in the database.
              </div>
            )}
            {officers.map((officer) => (
              <div
                key={officer.id}
                className="flex flex-col justify-between space-y-4 rounded-lg border border-l-4 border-l-blue-600 bg-card p-4 transition-all hover:shadow-md sm:flex-row sm:items-start sm:space-y-0"
              >
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                    {officer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{officer.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{officer.position}</p>
                    <div className="mt-3 flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium text-foreground">
                            {officer.activeCases}
                          </span>{" "}
                          Active
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium text-foreground">
                            {officer.resolvedCases}
                          </span>{" "}
                          Resolved
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium text-foreground">
                            {officer.performance}%
                          </span>{" "}
                          Performance
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 sm:text-right">
                  <Badge variant="outline" className="mb-1 w-fit bg-secondary/50">
                    Avg: {officer.avgResponseTime}
                  </Badge>
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => setSelectedOfficer(officer)}>
                      View Cases
                    </Button>
                    <Button size="sm" className="flex-1 sm:flex-none bg-black hover:bg-black/90 text-white" onClick={() => setAssignOfficer(officer)}>
                      Assign Case
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedOfficer} onOpenChange={(open) => !open && setSelectedOfficer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedOfficer?.fullName} Cases</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedOfficer?.cases?.length ? selectedOfficer.cases.map((caseItem) => (
              <div key={caseItem.id} className="rounded-lg border p-3">
                <p className="text-sm font-semibold">{caseItem.caseNumber}</p>
                <p className="text-sm text-muted-foreground">{caseItem.title}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline">{caseItem.status}</Badge>
                  <Badge variant="secondary">{caseItem.priority}</Badge>
                </div>
              </div>
            )) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No cases assigned.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assignOfficer} onOpenChange={(open) => !open && setAssignOfficer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Case to {assignOfficer?.fullName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Case</Label>
              <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select case" />
                </SelectTrigger>
                <SelectContent className="z-[90] max-h-72 bg-background">
                  {assignableCases.map((caseItem) => (
                    <SelectItem key={caseItem.id} value={caseItem.id}>
                      {caseItem.caseNumber} - {caseItem.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={assignCase} className="bg-black text-white hover:bg-black/90">Assign Case</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
