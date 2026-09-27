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
import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EvidenceViewer } from "@/components/cases/evidence-viewer"
import { ImagePreviewGrid } from "@/components/evidence/image-preview-grid"
import Image from "next/image"

type AdminUser = {
  id: string
  name: string
  email: string
  street: string
  phone: string
  bio: string
  photoUrl: string
  gender: string
  role: string
  registered: string
  registeredAt: string
  updatedAt: string
  locationAddress: string
  dateOfBirth: string
  twoFactorEnabled: boolean
  suspensionReason: string
  hasGovernmentId: boolean
  status: "Pending" | "Verified" | "Suspended"
}

interface UsersTabProps {
  users?: AdminUser[]
  onUpdated?: () => void
}

export function UsersTab({ users = [], onUpdated }: UsersTabProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [detailsTarget, setDetailsTarget] = useState<AdminUser | null>(null)
  const [suspensionTarget, setSuspensionTarget] = useState<AdminUser | null>(null)
  const [remarks, setRemarks] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState("")
  const [governmentIdImage, setGovernmentIdImage] = useState("")
  const [governmentIdUserId, setGovernmentIdUserId] = useState("")
  const [showGovernmentIdPreview, setShowGovernmentIdPreview] = useState(false)
  const [governmentIdLoading, setGovernmentIdLoading] = useState(false)
  const [governmentIdError, setGovernmentIdError] = useState("")

  async function updateStatus(id: string, status: AdminUser["status"], reason?: string) {
    setIsSaving(true)
    setActionError("")
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(reason ? { remarks: reason } : {}) }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to update user status")
      if (status === "Suspended") {
        setSuspensionTarget(null)
        setRemarks("")
      }
      onUpdated?.()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to update user status")
    } finally {
      setIsSaving(false)
    }
  }

  const requestSuspension = (user: AdminUser) => {
    setSuspensionTarget(user)
    setRemarks("")
    setActionError("")
  }

  useEffect(() => {
    setGovernmentIdImage("")
    setGovernmentIdUserId("")
    setGovernmentIdLoading(false)
    setShowGovernmentIdPreview(false)
    setGovernmentIdError("")
    if (!detailsTarget?.hasGovernmentId) return

    const targetId = detailsTarget.id
    const controller = new AbortController()
    setGovernmentIdLoading(true)

    async function loadGovernmentId() {
      try {
        const response = await fetch(`/api/admin/users/${encodeURIComponent(targetId)}/government-id`, { credentials: "same-origin", signal: controller.signal })
        const result = await response.json()
        if (!response.ok || !result.success || !result.data) throw new Error(result.message || "Unable to load ID image.")
        setGovernmentIdImage(`data:${result.data.mimeType};base64,${result.data.imageBase64}`)
        setGovernmentIdUserId(targetId)
      } catch (error) {
        if (!controller.signal.aborted) {
          setGovernmentIdError(error instanceof Error ? error.message : "Unable to load ID image.")
        }
      } finally {
        if (!controller.signal.aborted) setGovernmentIdLoading(false)
      }
    }

    void loadGovernmentId()
    return () => controller.abort()
  }, [detailsTarget?.id, detailsTarget?.hasGovernmentId])

  const pendingCount = users.filter((user) => user.status === "Pending").length
  const pageSize = 10
  const pageCount = Math.max(1, Math.ceil(users.length / pageSize))
  const visiblePage = Math.min(currentPage, pageCount)
  const visibleUsers = users.slice((visiblePage - 1) * pageSize, visiblePage * pageSize)

  return (
    <div className="space-y-4">
      {actionError && !suspensionTarget && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{actionError}</p>}
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
              {visibleUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium"><button type="button" className="text-left font-semibold text-primary hover:underline" onClick={() => setDetailsTarget(user)}>{user.name}</button></TableCell>
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
                          <Button size="sm" variant="outline" className="h-8 rounded-lg" disabled={!user.hasGovernmentId} onClick={() => setDetailsTarget(user)}>
                            Review ID
                          </Button>
                        )}
                        {user.status === "Pending" && (
                            <>
                                <Button size="sm" variant="outline" className="h-8 gap-1 rounded-lg" disabled={isSaving} onClick={() => updateStatus(user.id, "Verified")}>
                                    <Check className="h-4 w-4" /> {isSaving ? "Saving..." : "Approve"}
                                </Button>
                                <Button size="sm" variant="destructive" className="h-8 gap-1 rounded-lg" disabled={isSaving} onClick={() => requestSuspension(user)}>
                                    <X className="h-4 w-4" /> Reject
                                </Button>
                            </>
                        )}
                        {user.status === "Verified" && (
                              <Button size="sm" variant="secondary" className="h-8 rounded-lg" onClick={() => requestSuspension(user)}>
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
          {users.length > 0 && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">Showing {(visiblePage - 1) * pageSize + 1}–{Math.min(visiblePage * pageSize, users.length)} of {users.length} users</p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={visiblePage <= 1}>Previous</Button>
              <span className="min-w-20 text-center text-sm text-muted-foreground">Page {visiblePage} of {pageCount}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={visiblePage >= pageCount}>Next</Button>
            </div>
          </div>}
        </CardContent>
      </Card>
      <Dialog open={!!detailsTarget} onOpenChange={(open) => {
        if (!open) setDetailsTarget(null)
      }}>
        <DialogContent className="flex max-h-[85dvh] min-h-0 flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl">
          <div className="shrink-0 space-y-4 border-b border-border px-5 pb-4 pt-5 sm:px-6">
            <DialogHeader>
              <DialogTitle>User profile</DialogTitle>
              <DialogDescription>Account and profile information currently recorded for this user.</DialogDescription>
            </DialogHeader>
            {detailsTarget && <div className="flex items-center gap-4 rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {detailsTarget.photoUrl ? <Image unoptimized src={detailsTarget.photoUrl} width={56} height={56} alt="" className="h-full w-full object-cover" /> : detailsTarget.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div className="min-w-0"><p className="truncate text-lg font-semibold">{detailsTarget.name}</p><p className="break-all text-sm text-muted-foreground">{detailsTarget.email}</p><p className="mt-1 text-xs text-muted-foreground">{detailsTarget.role}</p></div>
              <Badge className="ml-auto shrink-0" variant={detailsTarget.status === "Verified" ? "success" : detailsTarget.status === "Suspended" ? "destructive" : "warning"}>{detailsTarget.status}</Badge>
            </div>}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-b-3xl px-5 py-5 sm:px-6">
          {detailsTarget && <div className="space-y-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ["User ID", detailsTarget.id], ["Contact number", detailsTarget.phone], ["Street address", detailsTarget.street],
                ["Reported location", detailsTarget.locationAddress], ["Date of birth", detailsTarget.dateOfBirth], ["Gender", detailsTarget.gender], ["Registered", detailsTarget.registered],
                ["Last profile update", detailsTarget.updatedAt],
                ["Two-factor authentication", detailsTarget.twoFactorEnabled ? "Enabled" : "Disabled"], ["Profile biography", detailsTarget.bio],
                ...(detailsTarget.suspensionReason ? [["Suspension reason", detailsTarget.suspensionReason]] : []),
              ].map(([label, value]) => <div key={label} className="min-w-0 rounded-xl border border-border p-3"><dt className="text-xs font-medium text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{value}</dd></div>)}
            </dl>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs font-medium text-muted-foreground">Government ID</p>
              {!detailsTarget.hasGovernmentId ? (
                <p className="mt-1 text-sm font-medium">No ID submitted</p>
              ) : governmentIdUserId === detailsTarget.id && governmentIdImage ? (
                <ImagePreviewGrid
                  items={[{ id: detailsTarget.id, name: "Government ID", src: governmentIdImage, fit: "contain" }]}
                  onPreview={() => setShowGovernmentIdPreview(true)}
                  className="mt-2 max-w-sm grid-cols-1 sm:grid-cols-1 lg:grid-cols-1"
                />
              ) : governmentIdLoading ? (
                <p className="mt-1 text-sm text-muted-foreground">Loading ID preview…</p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">{governmentIdError || "ID preview is unavailable."}</p>
              )}
            </div>
          </div>}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!suspensionTarget} onOpenChange={(open) => !open && !isSaving && setSuspensionTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend user account</DialogTitle>
            <DialogDescription>
              Add a reason for suspending {suspensionTarget?.name}. This remark will be recorded in the audit log.
            </DialogDescription>
          </DialogHeader>
          <label className="space-y-2 text-sm font-medium" htmlFor="suspension-remarks">
            Remarks <span className="text-destructive">*</span>
            <Textarea
              id="suspension-remarks"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Explain why this account is being suspended"
              rows={4}
              maxLength={1000}
            />
          </label>
          {actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSuspensionTarget(null)} disabled={isSaving}>Cancel</Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => suspensionTarget && updateStatus(suspensionTarget.id, "Suspended", remarks.trim())}
              disabled={isSaving || !remarks.trim()}
            >
              {isSaving ? "Saving..." : "Suspend account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showGovernmentIdPreview && governmentIdImage && <EvidenceViewer
        files={[{
          id: detailsTarget?.id ?? "government-id",
          name: `${detailsTarget?.name ?? "Resident"} government ID`,
          type: "image",
          url: governmentIdImage,
          thumbnail: governmentIdImage,
          size: "Government ID",
          uploadedAt: "Government ID",
        }]}
        onClose={() => setShowGovernmentIdPreview(false)}
      />}
    </div>
  );
}
