"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { ReportsHeader } from "@/components/reports/header"
import { ReportStats } from "@/components/reports/stats"
import { MonthlyTrendChart } from "@/components/dashboard/bar-chart-section" 
import { CategoryBreakdown } from "@/components/reports/category-breakdown"
import { AIPriorityDistribution } from "@/components/reports/priority-distribution"
import { PurokMap } from "@/components/reports/purok-map"
import { ResolutionStatusOverview } from "@/components/reports/resolution-overview"
import { KeyInsights } from "@/components/reports/key-insights"
import { OfficerResponseAnalysis } from "@/components/reports/officer-performance"

export default function ReportsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <ReportsHeader />
        
        <div className="mt-6">
           <ReportStats />
        </div>
        
        <div className="mt-6 h-[400px]">
          <MonthlyTrendChart />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="h-[400px]">
              <CategoryBreakdown />
          </div>
          <div className="h-[400px]">
              <AIPriorityDistribution />
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="h-[400px]">
               <PurokMap />
          </div>
          <div className="h-[400px]">
               <ResolutionStatusOverview />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6">
           {/* KeyInsights spans full width naturally in flex-col */}
           <KeyInsights />
           <OfficerResponseAnalysis />
        </div>
      </main>
    </div>
  )
}
