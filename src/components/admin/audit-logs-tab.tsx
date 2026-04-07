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

const mockLogs = [
  {
    id: 1,
    action: "Case Accessed",
    user: "Admin User",
    target: "IRIS-2026-001",
    timestamp: "03/04/2026 10:30 AM",
    ip: "192.168.1.1",
  },
  {
    id: 2,
    action: "Status Changed",
    user: "R. Augustine",
    target: "IRIS-2026-004",
    timestamp: "03/04/2026 09:15 AM",
    ip: "192.168.1.5",
  },
  {
    id: 3,
    action: "Evidence Downloaded",
    user: "Admin User",
    target: "IRIS-2026-003",
    timestamp: "03/03/2026 04:20 PM",
    ip: "192.168.1.1",
  },
];

export function AuditLogsTab() {
  return (
    <div className="space-y-4">
      <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Audit Logs</CardTitle>
            <div className="flex items-center gap-2">
                <div className="w-40">
                    <Input type="text" placeholder="dd/mm/yyyy" className="h-9 rounded-lg" />
                </div>
                  <Button variant="outline" size="sm" className="h-9 gap-1 rounded-lg">
                    <Filter className="h-4 w-4" /> Filter
                </Button>
                  <Button variant="outline" size="sm" className="h-9 gap-1 rounded-lg">
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
              {mockLogs.map((log) => (
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
