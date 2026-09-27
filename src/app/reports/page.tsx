"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { PageHeader } from "@/components/ui/page-header"
import { ReportStats } from "@/components/reports/stats"
import { FileText } from "lucide-react"
import { ExportMenu } from "@/components/ui/export-menu"
import { downloadCsvReport, downloadHtmlReport, type ReportExportSection } from "@/lib/report-export"

import { ReportsSkeleton } from "@/components/reports/reports-skeleton"
import type { MapIncident } from "@/components/reports/street-map"

import { useIsMobile } from "@/hooks/use-mobile"

const ChartPlaceholder = () => <div className="h-full min-h-64 animate-pulse rounded-2xl bg-muted" />
const MonthlyTrendChart = dynamic(
  () => import("@/components/dashboard/bar-chart-section").then((module) => module.MonthlyTrendChart),
  { loading: ChartPlaceholder },
)
const CategoryBreakdown = dynamic(
  () => import("@/components/reports/category-breakdown").then((module) => module.CategoryBreakdown),
  { loading: ChartPlaceholder },
)
const AIPriorityDistribution = dynamic(
  () => import("@/components/reports/priority-distribution").then((module) => module.AIPriorityDistribution),
  { loading: ChartPlaceholder },
)
const StreetMap = dynamic(
  () => import("@/components/reports/street-map").then((module) => module.StreetMap),
  { ssr: false, loading: ChartPlaceholder },
)
const ResolutionStatusOverview = dynamic(
  () => import("@/components/reports/resolution-overview").then((module) => module.ResolutionStatusOverview),
  { loading: ChartPlaceholder },
)

type ReportsData = {
  reportStats: { totalCases: number; resolutionRate: number; activeOfficers: number }
  monthlyTrend: { month: string; cases: number; violence?: number; harassment?: number; disturbance?: number; community?: number; other?: number }[]
  categoryBreakdown: { name: string; value: number }[]
  priorityDistribution: { name: string; value: number }[]
  mapIncidents: MapIncident[]
  resolutionStatus: {
    weekly: Record<string, number>
    monthly: Record<string, number>
    yearly: Record<string, number>
  }
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [reloadCount, setReloadCount] = useState(0)
  const [reportsData, setReportsData] = useState<ReportsData | null>(null)

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true)
        setLoadError("")

        const response = await fetch("/api/reports")
        const result = await response.json()

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Unable to load reports data.")
        }
        setReportsData(result.data)
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Unable to load reports data.")
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [reloadCount])

  const isMobile = useIsMobile()

  const [trendFilter, setTrendFilter] =
    useState<"cases" | "category">("cases")

  const baseCasesHeight =
    isMobile ? 220 : 300

  const baseCategoryHeight =
    isMobile ? 300 : 340

  const chartHeight =
    trendFilter === "category"
      ? baseCategoryHeight
      : baseCasesHeight

  function getReportExportSections(): ReportExportSection[] | null {
    if (!reportsData) return null
    return [
      {
        title: "Overview",
        rows: [
          ["Total cases", reportsData.reportStats.totalCases],
          ["Resolution rate (%)", reportsData.reportStats.resolutionRate],
          ["Active officers", reportsData.reportStats.activeOfficers],
        ],
      },
      {
        title: "Monthly case trend",
        headers: ["Month", "Total cases", "Violence", "Harassment", "Disturbance", "Community", "Other"],
        rows: reportsData.monthlyTrend.map((item) => [
          item.month,
          item.cases,
          item.violence ?? 0,
          item.harassment ?? 0,
          item.disturbance ?? 0,
          item.community ?? 0,
          item.other ?? 0,
        ]),
      },
      {
        title: "Category distribution",
        headers: ["Category", "Share of cases (%)"],
        rows: reportsData.categoryBreakdown.map((item) => [item.name, item.value]),
      },
      {
        title: "Priority distribution",
        headers: ["Priority", "Cases"],
        rows: reportsData.priorityDistribution.map((item) => [item.name, item.value]),
      },
      {
        title: "Resolution status by period",
        headers: ["Period", "Status", "Cases"],
        rows: Object.entries(reportsData.resolutionStatus).flatMap(([period, counts]) =>
          Object.entries(counts).map(([status, count]) => [period, status, count]),
        ),
      },
      {
        title: "Mapped incidents",
        headers: ["Incident", "Street", "Address", "Latitude", "Longitude", "Priority", "Status"],
        rows: reportsData.mapIncidents.map((item) => [item.title, item.street, item.address, item.latitude, item.longitude, item.priority, item.status]),
      },
    ]
  }

  function handleExportCsv() {
    const sections = getReportExportSections()
    if (sections) downloadCsvReport("iris-reports-summary.csv", "IRIS Reports Summary", sections)
  }

  function handleExportHtml() {
    const sections = getReportExportSections()
    if (sections) downloadHtmlReport("iris-reports-summary.html", "IRIS Reports Summary", sections)
  }

  if (loadError && !loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <PageHeader
            title="Reports & Analytics"
            description="View key insights on incident trends, resolutions, and operational performance."
            icon={<FileText className="h-5 w-5 text-white" />}
            actionSlot={<ExportMenu disabled={!reportsData} onCsv={handleExportCsv} onHtml={handleExportHtml} className="border-white/70 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900" />}
          />
          <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <span>{loadError}</span>
            <button type="button" onClick={() => { setLoading(true); setReloadCount((count) => count + 1) }} className="font-semibold underline">Retry loading reports</button>
          </div>
        </main>
      </div>
    )
  }

  if (loading) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Reports & Analytics"
          description="View key insights on incident trends, resolutions, and operational performance."
          icon={<FileText className="h-5 w-5 text-white" />}
          actionSlot={<ExportMenu disabled={!reportsData} onCsv={handleExportCsv} onHtml={handleExportHtml} className="border-white/70 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900" />}
        />

        {loadError && (
          <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <span>{loadError}</span>
            <button type="button" onClick={() => { setLoading(true); setReloadCount((count) => count + 1) }} className="font-semibold underline">Retry loading reports</button>
          </div>
        )}

        <div className="mt-4 sm:mt-6">
          <ReportsSkeleton />
        </div>
      </main>
    </div>
  )
}

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Reports & Analytics"
          description="View key insights on incident trends, resolutions, and operational performance."
          icon={<FileText className="h-5 w-5 text-white" />}
          actionSlot={<ExportMenu disabled={!reportsData} onCsv={handleExportCsv} onHtml={handleExportHtml} className="border-white/70 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900" />}
        />

        <div className="mt-4 sm:mt-6">
           <ReportStats data={reportsData?.reportStats} />
        </div>
        
        <div
          className={`
            mt-4 sm:mt-6
            transition-all duration-300
            ${
              trendFilter === "category"
                ? "min-h-[500px] lg:min-h-0"
                : "min-h-[400px] lg:min-h-0"
            }
          `}
        >
          <MonthlyTrendChart
            data={reportsData?.monthlyTrend}
            height={chartHeight}
            onFilterChange={setTrendFilter}
          />
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
               <StreetMap incidents={reportsData?.mapIncidents ?? []} />
          </div>
          <div className="h-80 sm:h-[400px]">
               <ResolutionStatusOverview data={reportsData?.resolutionStatus} />
          </div>
        </div>
      </main>
    </div>
  )
}
