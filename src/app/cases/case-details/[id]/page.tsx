"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { CaseDetailPanel } from "@/components/cases/case-detail-panel"
import type { CaseRecord } from "@/lib/types"

export default function CaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [caseData, setCaseData] = useState<CaseRecord | null>(null)
  const [officers, setOfficers] = useState<string[]>(["Unassigned"])
  const [loading, setLoading] = useState(true)

  async function loadCase(caseId: string) {
    const response = await fetch(`/api/cases/${encodeURIComponent(caseId)}`)
    const result = await response.json()
    if (result.success) {
      setCaseData(result.data)
    } else {
      console.error("Case not found:", caseId)
    }
  }

  useEffect(() => {
    async function loadPage() {
      if (id) {
        const decodedId = decodeURIComponent(id)
        await loadCase(decodedId)
        try {
          const response = await fetch("/api/officers")
          const result = await response.json()
          if (result.success) setOfficers(result.data)
        } catch (error) {
          console.error("Failed to load officers:", error)
        }
        setLoading(false)
      }
    }
    loadPage()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="hidden lg:flex h-screen shrink-0">
          <DashboardSidebar />
        </div>
        <main className="relative min-w-0 flex-1 overflow-hidden bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
      </div>
    )
  }

  if (!caseData) {
     return (
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="hidden lg:flex h-screen shrink-0">
          <DashboardSidebar />
        </div>
        <main className="relative min-w-0 flex-1 overflow-hidden bg-background flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Case not found.</p>
          <button 
            onClick={() => router.push("/cases")} 
            className="text-primary hover:underline font-medium"
          >
            Back to Cases
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex h-screen shrink-0">
        <DashboardSidebar />
      </div>
      <main className="relative min-w-0 flex-1 overflow-hidden bg-background flex flex-col">
        <CaseDetailPanel 
            caseData={caseData} 
            onClose={() => router.push("/cases")}
            onUpdate={() => {
                loadCase(decodeURIComponent(id))
            }}
            isPage={true}
            officers={officers}
        />
      </main>
    </div>
  )
}
