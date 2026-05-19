"use client"
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { PageHeader } from "@/components/ui/page-header"
import { StatCards, type DashboardStat } from "@/components/dashboard/stat-cards"
import { MonthlyTrendChart } from "@/components/dashboard/bar-chart-section"
import { IncidentCategoryChart } from "@/components/dashboard/incident-category-chart"
import { SideStatCards, type DashboardSideStats } from "@/components/dashboard/side-stat-cards"

import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { PageHeaderSkeleton } from "@/components/ui/page-header-skeleton"
import { RecentCases, type RecentCaseItem } from "@/components/dashboard/recent-cases"

type DashboardData = {
  stats?: DashboardStat[]
  monthlyTrend?: Parameters<typeof MonthlyTrendChart>[0]["data"]
  categoryBreakdown?: Parameters<typeof IncidentCategoryChart>[0]["data"]
  sideStats?: DashboardSideStats
  recentCases?: RecentCaseItem[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  // auth guard
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  // data fetch
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)

        const response = await fetch("/api/dashboard")
        const result = await response.json()

        if (!result.success) return

        const data = result.data

        setDashboardData({
          stats: data.stats ?? [],
          monthlyTrend: data.monthlyTrend ?? [],
          categoryBreakdown: data.categoryBreakdown ?? [],
          sideStats: data.sideStats ?? [],
          recentCases: data.recentCases ?? [],
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="hidden lg:flex h-screen shrink-0">
          <DashboardSidebar />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <PageHeaderSkeleton />
          <DashboardSkeleton />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex h-screen shrink-0">
        <DashboardSidebar />
      </div>

      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Dashboard"
          description="Monitor barangay incidents, case resolutions, reports, and operational activities in real time."
        />

        <StatCards data={dashboardData?.stats} />

{/* ANALYTICS + OPERATIONAL ROW 1 */}
<div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
  
  {/* LEFT: Monthly Trend */}
  <div className="lg:col-span-2">
    <MonthlyTrendChart data={dashboardData?.monthlyTrend} />
  </div>

  {/* RIGHT: Incident Category */}
  <IncidentCategoryChart data={dashboardData?.categoryBreakdown} />
</div>

{/* ANALYTICS + OPERATIONAL ROW 2 (MATCHED HEIGHT ROW) */}
<div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 items-stretch">

  {/* LEFT: Recent Cases (MATCHES Monthly Trend WIDTH) */}
  <div className="lg:col-span-2 h-full">
    <RecentCases data={dashboardData?.recentCases} />
  </div>

  {/* RIGHT: Operational Pulse (Side Stats) */}
  <div className="h-full">
    <SideStatCards data={dashboardData?.sideStats} />
  </div>
</div>
      </main>
    </div>
  )
}
