"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Briefcase } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { CasesTable } from "@/components/cases/cases-table"

export default function CasesPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <main className="relative min-w-0 flex-1 overflow-y-auto overflow-x-visible p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
        <PageHeader
          title="Case Management"
          description="Review, track, and manage all incident reports from filing to resolution."
          icon={<Briefcase className="h-5 w-5 text-white" />}
        />

        <CasesTable />
      </main>
    </div>
  )
}