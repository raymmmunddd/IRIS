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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="overflow-hidden border-[var(--iris-border)] bg-[var(--iris-surface)]/95 shadow-sm">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>System Audit Logs</CardTitle>
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
              <Input
                type="text"
                placeholder="dd/mm/yyyy"
                className="col-span-2 h-9 w-full rounded-lg sm:w-40"
                value={filterDate}
                onChange={(event) => setFilterDate(event.target.value)}
              />
              <Button variant="outline" size="sm" className="h-9 gap-1 rounded-lg px-3">
                <Filter className="h-4 w-4" /> Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1 rounded-lg px-3"
                onClick={handleExport}
                disabled={filteredLogs.length === 0}
              >
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[720px]">
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
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline" className="font-normal bg-slate-50">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium">{log.user}</TableCell>
                    <TableCell className="whitespace-nowrap">{log.target}</TableCell>
                    <TableCell className="whitespace-nowrap">{log.timestamp}</TableCell>
                    <TableCell className="whitespace-nowrap text-right text-muted-foreground">{log.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
