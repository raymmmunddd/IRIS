'use client';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Filter } from "lucide-react";
import { Input } from "@/components/ui/input"; // Assuming you might replace this with a DatePicker later
import { useMemo, useState } from "react";

type AdminAuditLog = {
  id: string
  action: string
  user: string
  target: string
  timestamp: string
  ip: string
}

interface AuditLogsTabProps {
  logs?: AdminAuditLog[]
}

export function AuditLogsTab({ logs = [] }: AuditLogsTabProps) {
  const [filterDate, setFilterDate] = useState("")

  const filteredLogs = useMemo(() => {
    const value = filterDate.trim()
    if (!value) return logs
    return logs.filter((log) => log.timestamp.toLowerCase().includes(value.toLowerCase()))
  }, [filterDate, logs])

  function handleExport() {
    const rows = [
      ["Action", "User", "Target", "Timestamp", "IP Address"],
      ...filteredLogs.map((log) => [log.action, log.user, log.target, log.timestamp, log.ip]),
    ]
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "audit-logs.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Audit Logs</CardTitle>
            <div className="flex items-center gap-2">
                <div className="w-40">
                    <Input type="text" placeholder="dd/mm/yyyy" className="h-9 rounded-lg" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} />
                </div>
                  <Button variant="outline" size="sm" className="h-9 gap-1 rounded-lg">
                    <Filter className="h-4 w-4" /> Filter
                </Button>
                  <Button variant="outline" size="sm" className="h-9 gap-1 rounded-lg" onClick={handleExport} disabled={filteredLogs.length === 0}>
                    <Download className="h-4 w-4" /> Export
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No audit logs found.
                  </TableCell>
                </TableRow>
              )}
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-normal bg-slate-50">
                        {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{log.target}</TableCell>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{log.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
