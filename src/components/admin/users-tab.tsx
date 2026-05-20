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
import { Check, ShieldAlert, Users, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

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
  pagination?: { page: number; pageSize: number; total: number; totalPages: number }
  onPageChange?: (page: number) => void
  onUpdated?: () => void
}

export function UsersTab({ users = [], pagination, onPageChange, onUpdated }: UsersTabProps) {
  const [confirmAction, setConfirmAction] = useState<{ user: AdminUser; status: AdminUser["status"] } | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  async function updateStatus(id: string, status: AdminUser["status"]) {
    setIsUpdating(true)
    try {
      await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      setConfirmAction(null)
      onUpdated?.()
    } finally {
      setIsUpdating(false)
    }
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
                                <Button size="sm" variant="destructive" className="h-8 gap-1 rounded-lg" onClick={() => setConfirmAction({ user, status: "Suspended" })}>
                                    <X className="h-4 w-4" /> Reject
                                </Button>
                            </>
                        )}
                        {user.status === "Verified" && (
                              <Button size="sm" variant="secondary" className="h-8 rounded-lg" onClick={() => setConfirmAction({ user, status: "Suspended" })}>
                                Suspend
                            </Button>
                        )}
                        {user.status === "Suspended" && (
                              <Button size="sm" variant="default" className="h-8 rounded-lg bg-slate-900" onClick={() => setConfirmAction({ user, status: "Verified" })}>
                                Reinstate
                            </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex flex-col gap-2 border-t pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                Page {pagination.page} of {pagination.totalPages} - {pagination.total} users
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(Math.min(pagination.totalPages, pagination.page + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <DialogTitle>
              {confirmAction?.status === "Suspended" ? "Suspend account?" : "Reinstate account?"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.status === "Suspended"
                ? `${confirmAction.user.name} will lose access until an admin reinstates the account.`
                : `${confirmAction?.user.name} will regain access to IRIS.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button
              variant={confirmAction?.status === "Suspended" ? "destructive" : "default"}
              onClick={() => confirmAction && updateStatus(confirmAction.user.id, confirmAction.status)}
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : confirmAction?.status === "Suspended" ? "Suspend" : "Reinstate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
