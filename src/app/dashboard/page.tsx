"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh"
import { useIsMobile } from "@/hooks/use-mobile"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { PageHeader } from "@/components/ui/page-header"
import { StatCards, type DashboardStat } from "@/components/dashboard/stat-cards"
import { SideStatCards } from "@/components/dashboard/side-stat-cards"

import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { PageHeaderSkeleton } from "@/components/ui/page-header-skeleton"
import { RecentCases } from "@/components/dashboard/recent-cases"
import { ResidentCalendar, type ResidentScheduledCase } from "@/components/resident/resident-calendar"
import type { MonthlyTrendItem } from "@/components/dashboard/bar-chart-section"

const ChartPlaceholder = () => <div className="h-full min-h-64 animate-pulse rounded-2xl bg-muted" />
const MonthlyTrendChart = dynamic(
  () => import("@/components/dashboard/bar-chart-section").then((module) => module.MonthlyTrendChart),
  { loading: ChartPlaceholder },
)
const AIPriorityDistribution = dynamic(
  () => import("@/components/reports/priority-distribution").then((module) => module.AIPriorityDistribution),
  { loading: ChartPlaceholder },
)

type DashboardData = {
  stats?: DashboardStat[]
  monthlyTrend?: MonthlyTrendItem[]
  priorityDistribution?: { name: string; value: number }[]
  sideStats?: { pending: number; underReview: number; officers: number; users: number }
  recentCases?: Parameters<typeof RecentCases>[0]["data"]
  upcomingHearings?: ResidentScheduledCase[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [reloadCount, setReloadCount] = useState(0)

  const [trendFilter, setTrendFilter] = useState<"cases" | "category">("cases")

  const isMobile = useIsMobile()
  const baseCasesHeight = isMobile ? 200 : 300
  const baseCategoryHeight = isMobile ? 240 : 340

  const chartHeight =
    trendFilter === "category" ? baseCategoryHeight : baseCasesHeight
  // auth guard
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  useRealtimeRefresh(async (signal) => {
    try {
      const response = await fetch("/api/dashboard", { signal })
      const result = await response.json()

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Unable to load dashboard data.")
      }

      const data = result.data
      setDashboardData({
        stats: data.stats ?? [],
        monthlyTrend: data.monthlyTrend ?? [],
        priorityDistribution: data.priorityDistribution ?? [],
        sideStats: data.sideStats,
        recentCases: data.recentCases ?? [],
        upcomingHearings: data.upcomingHearings ?? [],
      })
      setLoadError("")
    } catch (error) {
      if (!signal.aborted && !dashboardData) {
        setLoadError(error instanceof Error ? error.message : "Unable to load dashboard data.")
      }
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, { topics: ["iris:cases"], refreshKey: reloadCount, enabled: isAuthenticated() })

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <DashboardSidebar />

        <main className="min-w-0 flex-1 overflow-y-auto p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
          <PageHeaderSkeleton />
          <DashboardSkeleton />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <main className="min-w-0 flex-1 overflow-y-auto p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
        <PageHeader
          title="Dashboard"
          description="Monitor barangay incidents, case resolutions, reports, and operational activities in real time."
        />

        {loadError && (
          <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <span>{loadError}</span>
            <button type="button" onClick={() => { setLoading(true); setReloadCount((count) => count + 1) }} className="font-semibold underline">Retry loading dashboard</button>
          </div>
        )}

        <StatCards data={dashboardData?.stats} />

        {/* ANALYTICS + OPERATIONAL ROW 1 */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MonthlyTrendChart
              data={dashboardData?.monthlyTrend}
              height={chartHeight}
              onFilterChange={setTrendFilter}
            />
          </div>


          <AIPriorityDistribution data={dashboardData?.priorityDistribution} />
        </div>

        {/* ANALYTICS + OPERATIONAL ROW 2 */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 items-stretch">
          <div className="lg:col-span-2 h-full">
            <RecentCases data={dashboardData?.recentCases} />
          </div>

          <div className="h-full">
            <SideStatCards data={dashboardData?.sideStats} />
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <ResidentCalendar
            scheduledCases={dashboardData?.upcomingHearings ?? []}
            title="Upcoming hearings"
            description="Scheduled hearings across active cases"
          />
        </div>
      </main>
    </div>
  )
}
