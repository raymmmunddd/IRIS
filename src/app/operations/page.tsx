"use client"

import { useState } from "react"
import { Users, Calendar } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

import { OfficersTab } from "@/components/operations/officers-tab"
import { MediationTab } from "@/components/operations/mediation-tab"

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState("officers")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main className="relative flex-1 overflow-y-auto p-6 md:p-8">
        <DashboardHeader
          title="Operations"
          description="Manage officers and mediation sessions"
        />

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="officers" className="gap-2">
                <Users className="h-4 w-4" />
                Officers
              </TabsTrigger>
              <TabsTrigger value="mediation" className="gap-2">
                <Calendar className="h-4 w-4" />
                Mediation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="officers">
              <OfficersTab />
            </TabsContent>
            <TabsContent value="mediation">
              <MediationTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
