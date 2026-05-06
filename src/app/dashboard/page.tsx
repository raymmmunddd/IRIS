"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { MonthlyTrendChart } from "@/components/dashboard/bar-chart-section"
import { IncidentCategoryChart } from "@/components/dashboard/incident-category-chart"
import { ResolutionPerformanceChart } from "@/components/dashboard/resolution-performance-chart"
import { SideStatCards } from "@/components/dashboard/side-stat-cards"

type DashboardData = {
  stats?: Parameters<typeof StatCards>[0]["data"]
  monthlyTrend?: Parameters<typeof MonthlyTrendChart>[0]["data"]
  categoryBreakdown?: Parameters<typeof IncidentCategoryChart>[0]["data"]
  resolutionStatus?: Parameters<typeof ResolutionPerformanceChart>[0]["data"]
  sideStats?: Parameters<typeof SideStatCards>[0]["data"]
}

export default function DashboardPage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/dashboard")
        const result = await response.json()
        if (result.success) setDashboardData(result.data)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      }
    }

    loadDashboard()
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex h-screen shrink-0">
        <DashboardSidebar />
      </div>

      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <DashboardHeader 
          title="Dashboard" 
          description="Overview of complaint management system" 
        />
        <StatCards data={dashboardData?.stats} />

        <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MonthlyTrendChart data={dashboardData?.monthlyTrend} />
          </div>
          <IncidentCategoryChart data={dashboardData?.categoryBreakdown} />
        </div>

        <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ResolutionPerformanceChart data={dashboardData?.resolutionStatus} />
          </div>
          <SideStatCards data={dashboardData?.sideStats} />
        </div>
      </main>
    </div>
  )
}
