"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type CaseDialogCase = {
  caseNumber: string
  title: string
  category: string
  priority: string
  street: string
  address?: string
  complainant: string
  complainantContact?: string
  dateSubmitted?: string
  incidentDate?: string
  status?: string
  assignedTo?: string | null
  details?: string
}

export function BpatCaseDialog({
  open,
  onOpenChange,
  selectedCase,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCase: CaseDialogCase | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{selectedCase?.caseNumber ?? "Case details"}</DialogTitle>
        </DialogHeader>

        {selectedCase && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-foreground">{selectedCase.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{selectedCase.category}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Priority</p>
                <p className="mt-1 font-medium text-foreground">{selectedCase.priority}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Status</p>
                <p className="mt-1 font-medium text-foreground">{selectedCase.status ?? "Not set"}</p>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-card p-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Complainant</p>
                <p className="mt-1 font-medium text-foreground">{selectedCase.complainant}</p>
                <p className="text-xs text-muted-foreground">{selectedCase.complainantContact ?? "Not provided"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Location</p>
                <p className="mt-1 font-medium text-foreground">{selectedCase.street}</p>
                <p className="text-xs text-muted-foreground">{selectedCase.address ?? "No address recorded"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Submitted</p>
                <p className="mt-1 text-foreground">{selectedCase.dateSubmitted ?? "Not set"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Incident date</p>
                <p className="mt-1 text-foreground">{selectedCase.incidentDate ?? "Not set"}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Assigned officer</p>
              <p className="mt-1 text-foreground">{selectedCase.assignedTo ?? "Unassigned"}</p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Case details</p>
              <p className="mt-1 leading-relaxed text-foreground">{selectedCase.details ?? "No additional details recorded."}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
