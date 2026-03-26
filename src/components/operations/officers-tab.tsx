"use client"

import {
  Users,
  FileText,
  TrendingUp,
  Award,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { mockOfficers } from "@/lib/mock-operations"

export function OfficersTab() {
  const totalOfficers = mockOfficers.length
  const totalActiveCases = mockOfficers.reduce((sum, o) => sum + o.activeCases, 0)
  const totalResolvedCases = mockOfficers.reduce((sum, o) => sum + o.resolvedCases, 0)
  const avgPerformance = Math.round(
    mockOfficers.reduce((sum, o) => sum + o.performance, 0) / totalOfficers
  )

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Officers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOfficers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveCases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Cases</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResolvedCases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerformance}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Officers List */}
      <Card className="col-span-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>BPAT Members</CardTitle>
          <Button className="bg-black hover:bg-black/90 text-white">Add Officer</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOfficers.map((officer) => (
              <div
                key={officer.id}
                className="flex flex-col justify-between space-y-4 rounded-lg border border-l-4 border-l-blue-600 bg-card p-4 shadow-sm sm:flex-row sm:items-start sm:space-y-0"
              >
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                    {officer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{officer.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{officer.position}</p>
                    <div className="mt-3 flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium text-foreground">
                            {officer.activeCases}
                          </span>{" "}
                          Active
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium text-foreground">
                            {officer.resolvedCases}
                          </span>{" "}
                          Resolved
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium text-foreground">
                            {officer.performance}%
                          </span>{" "}
                          Performance
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 sm:text-right">
                  <Badge variant="outline" className="mb-1 w-fit">
                    Avg: {officer.avgResponseTime}
                  </Badge>
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                      View Cases
                    </Button>
                    <Button size="sm" className="flex-1 sm:flex-none bg-black hover:bg-black/90 text-white">
                      Assign Case
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
