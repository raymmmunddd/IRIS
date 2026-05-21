"use client"
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { PageHeader } from "@/components/ui/page-header"
import { ReportStats } from "@/components/reports/stats"
import { MonthlyTrendChart } from "@/components/dashboard/bar-chart-section" 
import { CategoryBreakdown } from "@/components/reports/category-breakdown"
import { AIPriorityDistribution } from "@/components/reports/priority-distribution"
import { StreetMap, type StreetHeatStat } from "@/components/reports/street-map"
import { ResolutionStatusOverview } from "@/components/reports/resolution-overview"
import { KeyInsights } from "@/components/reports/key-insights"
import { Download, FileText } from "lucide-react"

type ReportsData = {
  reportStats?: {
    totalCases: number
    resolutionRate: number
    activeOfficers: number
  }
  monthlyTrend?: {
    month: string
    cases: number
    violence?: number
    harassment?: number
    fraud?: number
    disturbance?: number
    property?: number
    community?: number
    child?: number
  }[]
  categoryBreakdown?: { name: string; value: number; color?: string }[]
  priorityDistribution?: { name: string; value: number; color?: string }[]
  streetStats?: StreetHeatStat[]
  resolutionStatus?: Partial<Record<"today" | "weekly" | "monthly" | "yearly", Record<string, number>>>
  keyInsights?: {
    topStreet: string
    topStreetCount: number
    topCategory: string
    topCategoryCount: number
  }
  officerPerformance?: {
    name: string
    fullName: string
    position: string
    activeCases: number
    resolvedCases: number
    performance: number
    avgResponseTime: string
  }[]
}

export default function ReportsPage() {
  const [reportsData, setReportsData] = useState<ReportsData | null>(null)

  useEffect(() => {
    async function loadReports() {
      try {
        const response = await fetch("/api/reports")
        const result = await response.json()
        if (result.success) setReportsData(result.data)
      } catch (error) {
        console.error("Failed to load reports data:", error)
      }
    }

    loadReports()
  }, [])

  const exportReportsCsv = () => {
    if (!reportsData) return

    const rows: string[][] = [["Section", "Name", "Value", "Detail"]]
    const addRow = (section: string, name: string, value: string | number, detail = "") => {
      rows.push([section, name, String(value), detail])
    }

    if (reportsData.reportStats) {
      addRow("Stats", "Total Cases", reportsData.reportStats.totalCases)
      addRow("Stats", "Resolution Rate", `${reportsData.reportStats.resolutionRate}%`)
      addRow("Stats", "Active Officers", reportsData.reportStats.activeOfficers)
    }

    reportsData.monthlyTrend?.forEach((item) => addRow("Monthly Trend", item.month, item.cases))
    reportsData.categoryBreakdown?.forEach((item) => addRow("Category Breakdown", item.name, `${item.value}%`))
    reportsData.priorityDistribution?.forEach((item) => addRow("Priority Distribution", item.name, item.value))
    reportsData.streetStats?.forEach((item) => addRow("Street Stats", item.name, item.cases, `${item.urgent} urgent`))
    reportsData.officerPerformance?.forEach((item) => addRow("Officer Performance", item.fullName, `${item.performance}%`, `${item.activeCases} active, ${item.resolvedCases} resolved`))

    if (reportsData.keyInsights) {
      addRow("Key Insights", "Top Street", reportsData.keyInsights.topStreet, `${reportsData.keyInsights.topStreetCount} cases`)
      addRow("Key Insights", "Top Category", reportsData.keyInsights.topCategory, `${reportsData.keyInsights.topCategoryCount} cases`)
    }

    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `iris-reports-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex h-screen shrink-0">
        <DashboardSidebar />
      </div>

      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Reports & Analytics"
          description="View key insights on incident trends, resolutions, and operational performance."
          icon={<FileText className="h-5 w-5 text-white" />}
          actionSlot={
            <button
              type="button"
              onClick={exportReportsCsv}
              disabled={!reportsData}
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          }
        />

        <div className="mt-4 sm:mt-6">
           <ReportStats data={reportsData?.reportStats} />
        </div>
        
        <div className="mt-4 sm:mt-6 h-80 sm:h-[400px]">
          <MonthlyTrendChart data={reportsData?.monthlyTrend} />
        </div>

        <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 md:grid-cols-2">
          <div className="h-80 sm:h-[400px]">
              <CategoryBreakdown data={reportsData?.categoryBreakdown} />
          </div>
          <div className="h-80 sm:h-[400px]">
              <AIPriorityDistribution data={reportsData?.priorityDistribution} />
          </div>
        </div>

        <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 md:grid-cols-2">
          <div className="h-80 sm:h-[400px]">
               <StreetMap data={reportsData?.streetStats} />
          </div>
          <div className="h-80 sm:h-[400px]">
               <ResolutionStatusOverview data={reportsData?.resolutionStatus} />
          </div>
        </div>

        <div className="mt-4 sm:mt-6 flex flex-col gap-4 sm:gap-6">
           {/* KeyInsights spans full width naturally in flex-col */}
           <KeyInsights data={reportsData?.keyInsights} />
           {/* <OfficerResponseAnalysis officers={reportsData?.officerPerformance} /> */}
        </div>
      </main>
    </div>
  )
}
