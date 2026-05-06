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
import { Check, Users, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AdminUser = {
  id: string
  name: string
  email: string
  street: string
  registered: string
  status: "Pending" | "Verified" | "Suspended"
}

interface UsersTabProps {
  users?: AdminUser[]
  onUpdated?: () => void
}

export function UsersTab({ users = [], onUpdated }: UsersTabProps) {
  async function updateStatus(id: string, status: AdminUser["status"]) {
    await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    onUpdated?.()
  }

  const pendingCount = users.filter((user) => user.status === "Pending").length

  return (
    <div className="space-y-4">
      <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Resident Verification
            </CardTitle>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">{pendingCount} Pending</Badge>
          </div>
          <CardDescription>
            Manage user registration and account status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Street</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.street}</TableCell>
                  <TableCell>{user.registered}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        user.status === "Pending" ? "warning" : 
                        user.status === "Verified" ? "success" : "destructive"
                      }
                      className={
                        user.status === "Pending" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80" :
                        user.status === "Verified" ? "bg-green-100 text-green-800 hover:bg-green-100/80" :
                        "bg-red-100 text-red-800 hover:bg-red-100/80"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        {user.status === "Pending" && (
                            <>
                                <Button size="sm" variant="outline" className="h-8 gap-1 rounded-lg" onClick={() => updateStatus(user.id, "Verified")}>
                                    <Check className="h-4 w-4" /> Approve
                                </Button>
                                <Button size="sm" variant="destructive" className="h-8 gap-1 rounded-lg" onClick={() => updateStatus(user.id, "Suspended")}>
                                    <X className="h-4 w-4" /> Reject
                                </Button>
                            </>
                        )}
                        {user.status === "Verified" && (
                              <Button size="sm" variant="secondary" className="h-8 rounded-lg" onClick={() => updateStatus(user.id, "Suspended")}>
                                Suspend
                            </Button>
                        )}
                        {user.status === "Suspended" && (
                              <Button size="sm" variant="default" className="h-8 rounded-lg bg-slate-900" onClick={() => updateStatus(user.id, "Verified")}>
                                Reinstate
                            </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
