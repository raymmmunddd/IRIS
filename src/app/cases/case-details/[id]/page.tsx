"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { CaseDetailPanel } from "@/components/cases/case-detail-panel"
import { Skeleton } from "@/components/ui/skeleton"
import type { CaseRecord } from "@/lib/types"
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh"

type CaseResponse = {
  success?: boolean
  message?: string
  data?: CaseRecord
}

async function readCaseResponse(response: Response): Promise<CaseRecord> {
  const body = await response.text()
  let result: CaseResponse | null = null

  if (body.trim()) {
    try {
      result = JSON.parse(body) as CaseResponse
    } catch {
      throw new Error("The case service returned an invalid response.")
    }
  }

  if (!response.ok || result?.success !== true || !result.data) {
    throw new Error(result?.message || "Unable to load this case.")
  }

  return result.data
}

export default function CaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [caseData, setCaseData] = useState<CaseRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [reloadCount, setReloadCount] = useState(0)

  useRealtimeRefresh(async (signal) => {
    if (!id) return
    try {
      const response = await fetch(`/api/cases/${encodeURIComponent(decodeURIComponent(id))}`, { signal })
      setCaseData(await readCaseResponse(response))
      setLoadError("")
    } catch (error) {
      if (!signal.aborted && !caseData) {
        setLoadError(error instanceof Error ? error.message : "Unable to load this case.")
      }
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, { topics: ["iris:cases"], enabled: Boolean(id), refreshKey: `${id}:${reloadCount}` })

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="hidden lg:flex h-screen shrink-0">
          <DashboardSidebar />
        </div>
        <main aria-label="Loading case details" aria-busy="true" className="relative min-w-0 flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl space-y-5">
            <Skeleton className="h-12 w-64" />
            <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
              <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-48 w-full" />
              </div>
              <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
                <Skeleton className="h-6 w-40" />
                {[0, 1, 2].map((item) => <Skeleton key={item} className="h-20 w-full" />)}
              </div>
            </div>
          </div>
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
          <p role="alert" className="text-muted-foreground">{loadError || "Case not found."}</p>
          {loadError && <button type="button" onClick={() => setReloadCount((count) => count + 1)} className="text-sm font-medium text-primary hover:underline">Retry</button>}
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
      <main className="relative min-w-0 flex-1 overflow-y-auto overflow-x-visible bg-background flex flex-col">
        <CaseDetailPanel 
            caseData={caseData} 
            onClose={() => router.push("/cases")}
            onUpdate={() => {
                setReloadCount((count) => count + 1)
            }}
        />
      </main>
    </div>
  )
}
