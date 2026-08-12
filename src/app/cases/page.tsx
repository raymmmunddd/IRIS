"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Briefcase } from "lucide-react"

import { isAuthenticated } from "@/lib/auth"
import type { CaseRecord } from "@/lib/types"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { PageHeader } from "@/components/ui/page-header"
import { PageHeaderSkeleton } from "@/components/ui/page-header-skeleton"
import { CasesTable } from "@/components/cases/cases-table"
import { CaseDetailPanel } from "@/components/cases/case-detail-panel"
import { CasesSkeleton } from "@/components/cases/cases-skeleton"

export default function CasesPage() {
  const router = useRouter()

  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [cases, setCases] = useState<CaseRecord[]>([])

    useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    async function initialize() {
      try {
        const response = await fetch("/api/cases")
        const result = await response.json()

        if (result.success) {
          setCases(result.data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [router])

  function handleCaseUpdated(updatedCase: CaseRecord) {
    setSelectedCase(updatedCase)
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    async function initialize() {
      // Wait for the table/API to begin loading
      // (replace with your real initialization if needed)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setLoading(false)
    }

    initialize()
  }, [router])

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
        />

        <CasesTable
            cases={cases}
            onViewCase={(caseData) => setSelectedCase(caseData)}
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