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

type ApiEnvelope<T> = {
    success?: boolean
    message?: string
    data?: T
}

async function readApiData<T>(response: Response, fallbackMessage: string): Promise<T> {
    const body = await response.text()
    let result: ApiEnvelope<T> | null = null

    if (body.trim()) {
        try {
            result = JSON.parse(body) as ApiEnvelope<T>
        } catch {
            throw new Error(fallbackMessage)
        }
    }

    if (!response.ok || result?.success !== true || result.data === undefined) {
        throw new Error(result?.message || fallbackMessage)
    }

    return result.data
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
    const [noteError, setNoteError] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingContent, setEditingContent] = useState("")

    useEffect(() => {
        const controller = new AbortController()

        async function fetchNotes() {
            try {
                const response = await fetch(`/api/cases/${encodeURIComponent(caseId)}/notes`, { signal: controller.signal })
                const data = await readApiData<CaseNote[]>(response, "Unable to load case notes.")
                setNotes(data)
                setNoteError("")
            } catch (error) {
                if (!controller.signal.aborted) {
                    setNoteError(error instanceof Error ? error.message : "Unable to load case notes.")
                }
            }
        }

        void fetchNotes()
        return () => controller.abort()
    }, [caseId])

    async function saveNote() {
        if (!newNote.trim()) return

        setSaving(true)
        setNoteError("")
        try {
            const response = await fetch(`/api/cases/${encodeURIComponent(caseId)}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note: newNote.trim() }),
            })
            const note = await readApiData<CaseNote>(response, "Unable to save the case note.")
            setNotes((previous) => [note, ...previous])
            setNewNote("")
            toast.success("Note added")
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to save the case note."
            setNoteError(message)
            toast.error(message)
        } finally {
            setSaving(false)
        }
    }

    async function updateNote(id: string) {
        setNoteError("")
        try {
            const response = await fetch(`/api/cases/${encodeURIComponent(caseId)}/notes/${encodeURIComponent(id)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editingContent.trim() }),
            })
            const note = await readApiData<CaseNote>(response, "Unable to update the case note.")
            setNotes((previous) => previous.map((item) => item.id === id ? note : item))
            setEditingId(null)
            toast.success("Note updated")
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to update the case note."
            setNoteError(message)
            toast.error(message)
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

            {noteError && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{noteError}</p>}

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
                            title="Edit note"
                            aria-label="Edit note"
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
