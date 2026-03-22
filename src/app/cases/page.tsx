"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
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
      <DashboardSidebar />

      <main className="relative flex-1 overflow-y-auto p-6 lg:p-8">
        <DashboardHeader 
          title="Cases Management" 
          description="Manage and track all reported incidents"
        />
        <CasesTable />
      </main>
    </div>
  )
}
