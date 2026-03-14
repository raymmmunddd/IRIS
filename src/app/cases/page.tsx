import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { CasesTable } from "@/components/cases/cases-table"

export default function CasesPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <DashboardHeader title="Cases Management" />
        <CasesTable />
      </main>
    </div>
  )
}
