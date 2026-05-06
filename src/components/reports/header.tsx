"use client"

import { useState } from "react"
import { Calendar, ChevronDown, Download, FileText } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/header"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

export function ReportsHeader() {
  const { toast } = useToast()
  const [period, setPeriod] = useState("weekly")

  const downloadFile = (filename: string, content: string, type = "text/plain") => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCsv = () => {
    const content = [
      "metric,value",
      "Submitted,312",
      "Under Review,267",
      "Resolved,423",
      "Closed,285",
    ].join("\n")
    downloadFile("iris-report.csv", content, "text/csv")
    toast({ title: "CSV exported", description: "The CSV report has been downloaded.", variant: "success" })
  }

  const handleExportPdf = () => {
    window.print()
    toast({ title: "PDF export", description: "Use Save as PDF in the print dialog.", variant: "success" })
  }

  const handleExportQuarterly = () => {
    const summary = [
      "IRIS Quarterly Summary",
      "- Cases submitted: 934",
      "- Cases resolved: 812",
      "- Average resolution time: 2.8 days",
      "- Highest activity street: Mabini Street",
    ].join("\n")
    downloadFile("iris-quarterly-summary.txt", summary)
    toast({ title: "Quarterly summary exported", description: "Summary file downloaded.", variant: "success" })
  }

  return (
    <DashboardHeader
      title="Reports & Analytics"
      description="Detailed governance analytics and insights"
      actionSlot={(
        <>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-10 w-[140px] bg-[var(--iris-surface)]/95">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="border border-[var(--iris-border)] bg-[var(--iris-surface)]/95 backdrop-blur">
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-2 bg-[var(--iris-surface)]/95">
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 border border-[var(--iris-border)] bg-[var(--iris-surface)]/95 backdrop-blur"
            >
              <DropdownMenuItem onSelect={handleExportCsv} className="cursor-pointer">
                <FileText className="h-4 w-4" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleExportPdf} className="cursor-pointer">
                <Download className="h-4 w-4" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleExportQuarterly} className="cursor-pointer">
                <Calendar className="h-4 w-4" />
                Quarterly Summary
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    />
  )
}
