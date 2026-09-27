"use client"

import { useMemo, useState } from "react"
import { Download, Eye, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type AdminAuditLog = {
  id: string
  action: string
  user: string
  role: string
  description: string
  relatedRecord: string
  timestamp: string
  timestampLabel: string
}

interface AuditLogsTabProps {
  logs?: AdminAuditLog[]
}

function manilaDay(timestamp: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp))
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

export function AuditLogsTab({ logs = [] }: AuditLogsTabProps) {
  const [filterAction, setFilterAction] = useState("All")
  const [filterRole, setFilterRole] = useState("All")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null)

  const actions = useMemo(() => [...new Set(logs.map((log) => log.action))].sort(), [logs])
  const roles = useMemo(() => [...new Set(logs.map((log) => log.role))].sort(), [logs])
  const filteredLogs = useMemo(() => logs.filter((log) => {
    const day = manilaDay(log.timestamp)
    return (filterAction === "All" || log.action === filterAction)
      && (filterRole === "All" || log.role === filterRole)
      && (!dateFrom || day >= dateFrom)
      && (!dateTo || day <= dateTo)
  }), [dateFrom, dateTo, filterAction, filterRole, logs])
  const pageSize = 10
  const pageCount = Math.max(1, Math.ceil(filteredLogs.length / pageSize))
  const visiblePage = Math.min(currentPage, pageCount)
  const visibleLogs = filteredLogs.slice((visiblePage - 1) * pageSize, visiblePage * pageSize)

  function clearFilters() {
    setFilterAction("All")
    setFilterRole("All")
    setDateFrom("")
    setDateTo("")
    setCurrentPage(1)
  }

  function handleExport() {
    const rows = [
      ["Action", "Readable description", "Actor", "Role", "Related record", "Timestamp"],
      ...filteredLogs.map((log) => [log.action, log.description, log.user, log.role, log.relatedRecord, log.timestampLabel]),
    ]
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n")
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "iris-audit-logs.csv"
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return (
    <div className="space-y-4">
      <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>System Audit Logs</CardTitle>
              <CardDescription className="mt-1">Filter system activity and review a plain-language summary for each event.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1 rounded-lg" onClick={handleExport} disabled={filteredLogs.length === 0}>
              <Download className="h-4 w-4" /> Export filtered logs
            </Button>
          </div>
          <div className="grid gap-3 pt-2 sm:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1 text-xs font-medium text-muted-foreground">Action type
              <select value={filterAction} onChange={(event) => { setFilterAction(event.target.value); setCurrentPage(1) }} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground">
                <option value="All">All actions</option>{actions.map((action) => <option key={action} value={action}>{action}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">Actor role
              <select value={filterRole} onChange={(event) => { setFilterRole(event.target.value); setCurrentPage(1) }} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground">
                <option value="All">All roles</option>{roles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">From date
              <Input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setCurrentPage(1) }} />
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">To date
              <Input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setCurrentPage(1) }} />
            </label>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Filter className="h-4 w-4" />{filteredLogs.length} matching events</span>
            {(filterAction !== "All" || filterRole !== "All" || dateFrom || dateTo) && <Button type="button" variant="ghost" size="sm" onClick={clearFilters}><X className="mr-1 h-4 w-4" />Clear filters</Button>}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Action</TableHead><TableHead>Actor</TableHead><TableHead>Role</TableHead><TableHead>Time</TableHead><TableHead>Activity summary</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {visibleLogs.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No audit logs match these filters.</TableCell></TableRow>}
              {visibleLogs.map((log) => <TableRow key={log.id} className="cursor-pointer" onClick={() => setSelectedLog(log)}>
                <TableCell><Badge variant="outline" className="bg-slate-50 font-normal">{log.action}</Badge></TableCell>
                <TableCell className="font-medium">{log.user}</TableCell>
                <TableCell>{log.role}</TableCell>
                <TableCell className="whitespace-nowrap">{log.timestampLabel}</TableCell>
                <TableCell><div className="flex items-center justify-between gap-3"><span className="line-clamp-2 min-w-0">{log.description}</span><Button type="button" variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); setSelectedLog(log) }} title="View audit activity"><Eye className="mr-2 h-4 w-4" />View</Button></div></TableCell>
              </TableRow>)}
            </TableBody>
          </Table>
          {filteredLogs.length > 0 && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">Showing {(visiblePage - 1) * pageSize + 1}–{Math.min(visiblePage * pageSize, filteredLogs.length)} of {filteredLogs.length} events</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={visiblePage <= 1}>Previous</Button>
              <span className="min-w-20 text-center text-sm text-muted-foreground">Page {visiblePage} of {pageCount}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={visiblePage >= pageCount}>Next</Button>
            </div>
          </div>}
        </CardContent>
      </Card>
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Activity details</DialogTitle>
            <DialogDescription>Human-readable information recorded for this audit event.</DialogDescription>
          </DialogHeader>
          {selectedLog && <div className="space-y-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-primary">{selectedLog.action}</p><p className="mt-2 text-base font-medium leading-relaxed">{selectedLog.description}</p></div>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-3"><dt className="text-xs text-muted-foreground">Actor</dt><dd className="mt-1 break-words text-sm font-medium">{selectedLog.user}</dd></div>
              <div className="rounded-xl border border-border p-3"><dt className="text-xs text-muted-foreground">Role</dt><dd className="mt-1 text-sm font-medium">{selectedLog.role}</dd></div>
              <div className="rounded-xl border border-border p-3"><dt className="text-xs text-muted-foreground">Recorded at</dt><dd className="mt-1 text-sm font-medium">{selectedLog.timestampLabel}</dd></div>
              <div className="rounded-xl border border-border p-3"><dt className="text-xs text-muted-foreground">Related account or case</dt><dd className="mt-1 break-words text-sm font-medium">{selectedLog.relatedRecord}</dd></div>
            </dl>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  )
}
