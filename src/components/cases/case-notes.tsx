"use client"

import { useEffect, useState } from "react"
import { Save, Pencil, Check, X, MessageSquare } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"

type CaseNote = {
    id: string
    author: string
    content: string
    createdAt: string
    updatedAt?: string
}

interface CaseNotesProps {
    caseId: string
}

export function CaseNotes({
    caseId,
    }: CaseNotesProps) {
    const [notes, setNotes] = useState<CaseNote[]>([])
    const [newNote, setNewNote] = useState("")
    const [saving, setSaving] = useState(false)

    const [editingId, setEditingId] =
        useState<string | null>(null)

    const [editingContent, setEditingContent] =
    useState("")

    useEffect(() => {
        async function fetchNotes() {
            const res = await fetch(`/api/cases/${caseId}/notes`)
            const json = await res.json()

            if (json.success) {
            setNotes(json.notes)
            }
        }

        fetchNotes()
        }, [caseId])

    async function saveNote() {
        if (!newNote.trim()) return

    setSaving(true)

    const res = await fetch(`/api/cases/${caseId}/notes`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
            body: JSON.stringify({
            content: newNote,
        }),
    })

    const json = await res.json()

    if (json.success) {
        setNotes((prev) => [json.note, ...prev])
        setNewNote("")
        toast.success("Note added")
    }

    setSaving(false)
    }

    async function updateNote(id: string) {
    const res = await fetch(`/api/cases/${caseId}/notes/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: editingContent,
        }),
    })

    const json = await res.json()

    if (json.success) {
        setNotes((prev) =>
            prev.map((note) =>
            note.id === id
            ? json.note
            : note
            )
        )

            setEditingId(null)
        toast.success("Note updated")
        }
    }

    

    return (
        <div className="space-y-4">

        <div>
            <h3 className="text-sm font-semibold tracking-tight">
                Internal Notes
            </h3>

            <p className="text-xs text-muted-foreground">
                Visible only to barangay personnel.
            </p>
        </div>

        <div className="rounded-xl border bg-background p-4 space-y-4">

            <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                rows={4}
            />

            <Button
                onClick={saveNote}
                disabled={saving || !newNote.trim()}
                className="w-full"
            >
            <Save className="mr-2 h-4 w-4" />
                Save Note
            </Button>

            {notes.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center">

                <MessageSquare className="mx-auto h-6 w-6 text-muted-foreground" />

                <p className="mt-2 text-sm font-medium">
                    No notes yet
                </p>

                <p className="text-xs text-muted-foreground">
                    Internal case notes will appear here.
                </p>

            </div>
        )}

        <div className="space-y-3">

            {notes.map((note) => (

                <div
                    key={note.id}
                    className="rounded-lg border p-4"
                >

                <div className="flex items-start gap-3">

                    <Avatar className="h-9 w-9">
                    <AvatarFallback>
                        {note.author
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">

                    <div className="flex items-center justify-between">

                        <div>

                        <p className="font-medium text-sm">
                            {note.author}
                        </p>

                        <p className="text-xs text-muted-foreground">
                            {note.updatedAt
                            ? `Edited ${note.updatedAt}`
                            : note.createdAt}
                        </p>

                    </div>

                    {editingId !== note.id && (

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                            setEditingId(note.id)
                            setEditingContent(note.content)
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>

                    )}

                    </div>

                    {editingId === note.id ? (

                        <div className="space-y-3 mt-3">

                        <Textarea
                            value={editingContent}
                            onChange={(e) =>
                            setEditingContent(e.target.value)
                            }
                        />

                        <div className="flex justify-end gap-2">

                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setEditingId(null)
                            }
                            >
                            <X className="mr-1 h-4 w-4" />
                            Cancel
                            </Button>

                            <Button
                            size="sm"
                            onClick={() =>
                                updateNote(note.id)
                            }
                            >
                            <Check className="mr-1 h-4 w-4" />
                            Save
                            </Button>

                        </div>

                        </div>

                    ) : (

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                        {note.content}
                        </p>

                    )}

                    </div>

                </div>

                </div>

            ))}

            </div>

        </div>

        </div>
    )
}