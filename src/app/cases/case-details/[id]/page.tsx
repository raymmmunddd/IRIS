"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { CaseDetailPanel } from "@/components/cases/case-detail-panel"
import { getCaseById } from "@/lib/caseStorage"
import type { CaseRecord } from "@/lib/types"

export default function CaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [caseData, setCaseData] = useState<CaseRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const decodedId = decodeURIComponent(id)
      const data = getCaseById(decodedId)
      if (data) {
        setCaseData(data)
      } else {
        console.error("Case not found:", id)
      }
      setLoading(false)
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <DashboardSidebar />
        <main className="relative flex-1 overflow-hidden bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
      </div>
    )
  }

  if (!caseData) {
     return (
      <div className="flex h-screen overflow-hidden bg-background">
        <DashboardSidebar />
        <main className="relative flex-1 overflow-hidden bg-background flex flex-col items-center justify-center gap-4">
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
      <DashboardSidebar />
      <main className="relative flex-1 overflow-hidden bg-background flex flex-col">
        <CaseDetailPanel 
            caseData={caseData} 
            onClose={() => router.push("/cases")}
            onUpdate={() => {
                const updated = getCaseById(decodeURIComponent(id))
                if (updated) setCaseData(updated)
            }}
            isPage={true}
        />
      </main>
    </div>
  )
}
