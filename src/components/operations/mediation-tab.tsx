"use client"

import { useState } from "react"
import {
  Calendar,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type MediationSession = {
  id: string
  caseId: string
  parties: string[]
  mediator: string
  scheduledDate: string
  scheduledTime: string
  location: string
  status: "Scheduled" | "Completed"
}

interface MediationTabProps {
  sessions?: MediationSession[]
  mediators?: string[]
  onScheduled?: () => void
}

export function MediationTab({ sessions = [], mediators = [], onScheduled }: MediationTabProps) {
  const [caseId, setCaseId] = useState("")
  const [mediator, setMediator] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [location, setLocation] = useState("")
  const [complainant, setComplainant] = useState("")
  const [respondent, setRespondent] = useState("")
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [noticeSessionId, setNoticeSessionId] = useState("")
  const [reportSession, setReportSession] = useState<MediationSession | null>(null)
  const today = new Date().toISOString().slice(0, 10)
  const selectedNoticeSession = sessions.find((session) => session.id === noticeSessionId) ?? sessions[0]
  const noticeParties = selectedNoticeSession?.parties ?? ["[Complainant]", "[Respondent]"]

  async function scheduleSession() {
    if (!caseId || !mediator || !scheduledDate || !scheduledTime || !location) {
      toast.error("Complete the mediation schedule fields")
      return
    }

    if (scheduledDate < today) {
      toast.error("You cannot schedule mediation in the past")
      return
    }

    const response = await fetch("/api/operations/hearings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId, mediator, scheduledDate, scheduledTime, location }),
    })
    const result = await response.json()

    if (result.success) {
      toast.success("Mediation scheduled successfully")
      setCaseId("")
      setMediator("")
      setScheduledDate("")
      setScheduledTime("")
      setLocation("")
      setComplainant("")
      setRespondent("")
      onScheduled?.()
      return
    }

    toast.error(result.message || "Unable to schedule mediation")
  }

  return (
    <div className="space-y-6">
      {/* Mediation Actions */}
      <div className="flex gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Schedule Mediation</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Schedule Mediation Session</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="case-id">Case ID</Label>
                <Input id="case-id" placeholder="Paste database case ID" value={caseId} onChange={(event) => setCaseId(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mediator">Mediator</Label>
                <Select value={mediator} onValueChange={setMediator}>
                  <SelectTrigger id="mediator">
                    <SelectValue placeholder="Select mediator" />
                  </SelectTrigger>
                  <SelectContent>
                    {mediators.filter((item) => item !== "Unassigned").map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" min={today} value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" value={scheduledTime} onChange={(event) => setScheduledTime(event.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Barangay Hall - Conference Room" value={location} onChange={(event) => setLocation(event.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="complainant">Complainant</Label>
                  <Input id="complainant" value={complainant} onChange={(event) => setComplainant(event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="respondent">Respondent</Label>
                  <Input id="respondent" value={respondent} onChange={(event) => setRespondent(event.target.value)} />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={scheduleSession} className="bg-black hover:bg-black/90 text-white">
                Schedule Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={noticeOpen} onOpenChange={setNoticeOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Generate Notice</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Generate Mediation Notice</DialogTitle>
              <DialogDescription>Select a scheduled session and print the notice for the parties.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Session</Label>
                <Select value={noticeSessionId || selectedNoticeSession?.id || ""} onValueChange={setNoticeSessionId}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select mediation session" />
                  </SelectTrigger>
                  <SelectContent className="z-[90] bg-background">
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.caseId} - {session.scheduledDate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
                <p className="font-semibold">Notice of Mediation</p>
                <p className="mt-3">
                  This serves as notice that {noticeParties.join(" and ")} are requested to appear for barangay mediation before the Lupon Tagapamayapa.
                </p>
                {selectedNoticeSession && (
                  <div className="mt-3 space-y-1">
                    <p><span className="font-medium">Case:</span> {selectedNoticeSession.caseId}</p>
                    <p><span className="font-medium">Date and time:</span> {selectedNoticeSession.scheduledDate}, {selectedNoticeSession.scheduledTime}</p>
                    <p><span className="font-medium">Venue:</span> {selectedNoticeSession.location}</p>
                    <p><span className="font-medium">Mediator:</span> {selectedNoticeSession.mediator}</p>
                  </div>
                )}
                <p className="mt-3 text-muted-foreground">
                  Bring valid identification and any supporting documents relevant to the complaint.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNoticeOpen(false)}>Close</Button>
              <Button onClick={() => window.print()} disabled={!selectedNoticeSession}>
                Print Notice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mediation Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mediation Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Case ID</TableHead>
                <TableHead>Parties</TableHead>
                <TableHead>Mediator</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No mediation sessions found.
                  </TableCell>
                </TableRow>
              )}
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.caseId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-sm uppercase">
                      {session.parties.map((party, i) => (
                        <span key={i} className="text-xs font-semibold text-muted-foreground">{party}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{session.mediator}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium">{session.scheduledDate}</span>
                      <span className="text-muted-foreground">{session.scheduledTime}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {session.location}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        session.status === "Completed"
                          ? "border-green-200 bg-green-100 text-green-700 hover:bg-green-100/80"
                          : "border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100/80"
                      }
                      variant="outline"
                    >
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {session.status === "Completed" ? (
                      <Button size="sm" variant="outline" onClick={() => setReportSession(session)}>
                        View Report
                      </Button>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-black hover:bg-black/90 text-white">Record Outcome</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Record Mediation Outcome</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="outcome">Outcome</Label>
                              <Textarea
                                id="outcome"
                                placeholder="Describe the outcome of the mediation..."
                                rows={4}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="agreement-type">Agreement Type</Label>
                              <Input
                                id="agreement-type"
                                placeholder="e.g., Settlement, Partial Agreement"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="follow-up">Follow-up Required?</Label>
                              <Input id="follow-up" type="date" />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              onClick={() => toast.success("Outcome recorded successfully")}
                              className="bg-black hover:bg-black/90 text-white"
                            >
                              Save Outcome
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!reportSession} onOpenChange={(open) => !open && setReportSession(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Mediation Report</DialogTitle>
            <DialogDescription>{reportSession?.caseId}</DialogDescription>
          </DialogHeader>
          {reportSession && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Parties</p>
                  <p className="font-medium">{reportSession.parties.join(" vs ")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mediator</p>
                  <p className="font-medium">{reportSession.mediator}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date and Time</p>
                  <p className="font-medium">{reportSession.scheduledDate}, {reportSession.scheduledTime}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{reportSession.location}</p>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-semibold">Outcome Summary</p>
                <p className="mt-2 text-muted-foreground">
                  This completed mediation session is on record. Outcome notes can be expanded once recorded outcomes are persisted.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportSession(null)}>Close</Button>
            <Button onClick={() => window.print()}>Print Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
