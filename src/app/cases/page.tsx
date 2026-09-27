"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Briefcase } from "lucide-react"

import { isAuthenticated } from "@/lib/auth"
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh"
import type { CaseRecord } from "@/lib/types"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { PageHeader } from "@/components/ui/page-header"
import { PageHeaderSkeleton } from "@/components/ui/page-header-skeleton"
import { CasesTable } from "@/components/cases/cases-table"
import { CaseDetailPanel } from "@/components/cases/case-detail-panel"
import { CasesSkeleton } from "@/components/cases/cases-skeleton"
import { ExportMenu } from "@/components/ui/export-menu"
import { downloadCsvReport, downloadHtmlReport, type ReportExportSection } from "@/lib/report-export"

export default function CasesPage() {
  const router = useRouter()

  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [cases, setCases] = useState<CaseRecord[]>([])
  const [loadError, setLoadError] = useState("")
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login")
  }, [router])

  useRealtimeRefresh(async (signal) => {
    try {
      const response = await fetch("/api/cases?includeArchived=true", { signal })
      const result = await response.json()

      if (!response.ok || !result.success || !Array.isArray(result.data)) {
        throw new Error(result.message || "Unable to load cases.")
      }
      setCases(result.data)
      setSelectedCase((current) => current ? result.data.find((item: CaseRecord) => item.id === current.id) ?? current : null)
      setLoadError("")
    } catch (error) {
      if (!signal.aborted && cases.length === 0) {
        setLoadError(error instanceof Error ? error.message : "Unable to load cases.")
      }
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, { topics: ["iris:cases"], refreshKey: reloadCount, enabled: isAuthenticated() })

  function handleCaseUpdated(updatedCase: CaseRecord) {
    setSelectedCase(updatedCase)
  }

  function getCaseExportSections(): ReportExportSection[] {
    const statuses = new Map<string, number>()
    const categories = new Map<string, number>()
    for (const caseItem of cases) {
      const status = caseItem.currentStatus ?? caseItem.status
      statuses.set(status, (statuses.get(status) ?? 0) + 1)
      categories.set(caseItem.category, (categories.get(caseItem.category) ?? 0) + 1)
    }

    return [
      { title: "Overview", rows: [["Total cases", cases.length]] },
      {
        title: "Status breakdown",
        headers: ["Status", "Cases"],
        rows: [...statuses.entries()].sort(([left], [right]) => left.localeCompare(right)),
      },
      {
        title: "Category breakdown",
        headers: ["Category", "Cases"],
        rows: [...categories.entries()].sort(([left], [right]) => left.localeCompare(right)),
      },
    ]
  }

  function handleExportCsv() {
    downloadCsvReport("iris-all-cases-summary.csv", "IRIS Case Summary", getCaseExportSections())
  }

  function handleExportHtml() {
    downloadHtmlReport("iris-all-cases-summary.html", "IRIS Case Summary", getCaseExportSections())
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <DashboardSidebar />

        <main className="relative min-w-0 flex-1 overflow-y-auto overflow-x-visible p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
          <PageHeaderSkeleton />
          <CasesSkeleton />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <main className="relative min-w-0 flex-1 overflow-y-auto overflow-x-visible p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
        <PageHeader
          title="Case Management"
          description="Review, track, and manage all incident reports from filing to resolution."
          icon={<Briefcase className="h-5 w-5 text-white" />}
          actionSlot={<ExportMenu label="Export All" disabled={cases.length === 0} onCsv={handleExportCsv} onHtml={handleExportHtml} className="border-white/70 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900" />}
        />

        {loadError && (
          <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <span>{loadError}</span>
            <button type="button" onClick={() => { setLoading(true); setReloadCount((count) => count + 1) }} className="font-semibold underline">Retry loading cases</button>
          </div>
        )}

        <CasesTable
            cases={cases}
            onViewCase={(caseData) => setSelectedCase(caseData)}
            onUpdated={() => setReloadCount((count) => count + 1)}
        />

        {selectedCase && (
          <CaseDetailPanel
            caseData={selectedCase}
            onClose={() => setSelectedCase(null)}
            onCaseUpdated={handleCaseUpdated}
          />
        )}
      </main>
    </div>
  )
}
