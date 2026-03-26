"use client"

import { useState } from "react"
import {
  Calendar,
  MoreHorizontal,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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

import { mockMediationSessions } from "@/lib/mock-operations"

export function MediationTab() {
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
                <Input id="case-id" placeholder="IRIS-2026-XXX" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mediator">Mediator</Label>
                <Input id="mediator" placeholder="Select mediator" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Barangay Hall - Conference Room" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parties">Parties Involved</Label>
                <Textarea id="parties" placeholder="List all parties..." rows={3} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => toast.success("Mediation scheduled successfully")} className="bg-black hover:bg-black/90 text-white">
                Schedule Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="outline">Generate Notice (PDF)</Button>
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
              {mockMediationSessions.map((session) => (
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
                      <Button size="sm" variant="outline">
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
    </div>
  )
}
