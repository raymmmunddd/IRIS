"use client"

import { useEffect, useState } from "react"
import { Users, Calendar } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/ui/page-header"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

import { OfficersTab } from "@/components/operations/officers-tab"
import { MediationTab } from "@/components/operations/mediation-tab"

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState("officers")
  const [operationsData, setOperationsData] = useState<{
    officers: Parameters<typeof OfficersTab>[0]["officers"]
    mediationSessions: Parameters<typeof MediationTab>[0]["sessions"]
    assignableCases: Parameters<typeof OfficersTab>[0]["assignableCases"]
  }>({ officers: [], mediationSessions: [], assignableCases: [] })
  const [mediators, setMediators] = useState<string[]>([])

  async function loadOperations() {
    try {
      const response = await fetch("/api/operations")
      const result = await response.json()
      if (result.success) setOperationsData(result.data)
      const officersResponse = await fetch("/api/officers")
      const officersResult = await officersResponse.json()
      if (officersResult.success) setMediators(officersResult.data)
    } catch (error) {
      console.error("Failed to load operations data:", error)
    }
  }

  useEffect(() => {
    loadOperations()
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex h-screen shrink-0">
        <DashboardSidebar />
      </div>
      <main className="relative min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Operations"
          description="Assign cases to officers and manage field response activities."
          icon={<Users className="h-5 w-5 text-white" />}
        />

        <div className="mt-4 sm:mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0 overflow-x-auto">
              <TabsTrigger
                value="officers"
                className="relative rounded-none border-0 bg-transparent px-2 sm:px-4 py-3 text-sm font-medium text-muted-foreground shadow-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:shadow-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100 flex items-center gap-2 shrink-0"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Officers</span>
              </TabsTrigger>
              <TabsTrigger
                value="mediation"
                className="relative rounded-none border-0 bg-transparent px-2 sm:px-4 py-3 text-sm font-medium text-muted-foreground shadow-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:shadow-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100 flex items-center gap-2 shrink-0"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Mediation</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="officers">
              <OfficersTab officers={operationsData.officers} assignableCases={operationsData.assignableCases} onUpdated={loadOperations} />
            </TabsContent>
            <TabsContent value="mediation">
              <MediationTab sessions={operationsData.mediationSessions} mediators={mediators} onScheduled={loadOperations} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
