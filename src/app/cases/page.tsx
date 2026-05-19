"use client"
export const dynamic = 'force-dynamic'

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
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex h-screen shrink-0">
        <DashboardSidebar />
      </div>

      <main className="relative min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
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
