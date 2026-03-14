"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { MonthlyTrendChart } from "@/components/dashboard/bar-chart-section"
import { IncidentCategoryChart } from "@/components/dashboard/incident-category-chart"
import { ResolutionPerformanceChart } from "@/components/dashboard/resolution-performance-chart"
import { SideStatCards } from "@/components/dashboard/side-stat-cards"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <DashboardHeader title="Dashboard" />
        <StatCards />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MonthlyTrendChart />
          </div>
          <IncidentCategoryChart />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ResolutionPerformanceChart />
          </div>
          <SideStatCards />
        </div>
      </main>
    </div>
  )
}
