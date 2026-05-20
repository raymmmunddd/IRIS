'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pin, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type AdminAnnouncement = {
  id: string
  title: string
  content: string
  author: string
  date: string
  isPinned: boolean
}

interface AnnouncementsTabProps {
  announcements?: AdminAnnouncement[]
  pagination?: { page: number; pageSize: number; total: number; totalPages: number }
  onPageChange?: (page: number) => void
  onUpdated?: () => void
}

export function AnnouncementsTab({ announcements = [], pagination, onPageChange, onUpdated }: AnnouncementsTabProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<AdminAnnouncement | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminAnnouncement | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  function openCreateModal() {
    setEditingAnnouncement(null)
    setTitle("")
    setContent("")
    setIsModalOpen(true)
  }

  function openEditModal(announcement: AdminAnnouncement) {
    setEditingAnnouncement(announcement)
    setTitle(announcement.title)
    setContent(announcement.content)
    setIsModalOpen(true)
  }

  async function saveAnnouncement() {
    if (!title.trim() || !content.trim()) return

    setIsCreating(true)
    const response = await fetch(
      editingAnnouncement ? `/api/admin/announcements/${encodeURIComponent(editingAnnouncement.id)}` : "/api/admin/announcements",
      {
        method: editingAnnouncement ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      },
    )
    const result = await response.json()
    setIsCreating(false)

    if (!result.success) {
      toast.error(result.message || "Unable to save announcement")
      return
    }

    toast.success(editingAnnouncement ? "Announcement updated" : "Announcement published")
    setTitle("")
    setContent("")
    setEditingAnnouncement(null)
    setIsModalOpen(false)
    onUpdated?.()
  }

  async function deleteAnnouncement() {
    if (!deleteTarget) return

    setIsCreating(true)
    const response = await fetch(`/api/admin/announcements/${encodeURIComponent(deleteTarget.id)}`, {
      method: "DELETE",
    })
    const result = await response.json()
    setIsCreating(false)

    if (!result.success) {
      toast.error(result.message || "Unable to delete announcement")
      return
    }

    toast.success("Announcement deleted")
    setDeleteTarget(null)
    onUpdated?.()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="rounded-lg bg-slate-900 text-white hover:bg-slate-800" onClick={openCreateModal} disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" /> Create Announcement
        </Button>
      </div>
      
      <div className="grid gap-4">
        {announcements.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No announcements found.
            </CardContent>
          </Card>
        )}
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{announcement.title}</h3>
                    {announcement.isPinned && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                        <Pin className="mr-1 h-3 w-3" /> Pinned
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{announcement.content}</p>
                  <p className="text-sm text-muted-foreground pt-2">
                    By {announcement.author} • {announcement.date}
                  </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg" onClick={() => openEditModal(announcement)}>
                      <Edit className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteTarget(announcement)}>
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col gap-2 rounded-xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Page {pagination.page} of {pagination.totalPages} - {pagination.total} announcements
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? "Edit Announcement" : "Create Announcement"}</DialogTitle>
            <DialogDescription>{editingAnnouncement ? "Update the title or message for this announcement." : "Add a title and message for the barangay announcement."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-title">Title</Label>
              <Input id="announcement-title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-content">Announcement</Label>
              <Textarea
                id="announcement-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="min-h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={saveAnnouncement} disabled={isCreating || !title.trim() || !content.trim()}>
              {isCreating ? "Saving..." : editingAnnouncement ? "Save Changes" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
            <DialogDescription>
              This will remove {deleteTarget?.title ? `"${deleteTarget.title}"` : "this announcement"} from the announcements list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isCreating}>Cancel</Button>
            <Button variant="destructive" onClick={deleteAnnouncement} disabled={isCreating}>
              {isCreating ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
