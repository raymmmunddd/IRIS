"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { CasesHeaderBanner } from "@/components/cases/cases-header-banner"
import { CasesTable } from "@/components/cases/cases-table"

export default function CasesPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex h-screen shrink-0">
        <DashboardSidebar />
      </div>

      <main className="relative min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <CasesHeaderBanner />
        <CasesTable />
      </main>
    </div>
  )
}
