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
            <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
              <TabsTrigger
                value="officers"
                className="relative rounded-none border-0 bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground shadow-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:shadow-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100"
              >
                <Users className="h-4 w-4" />
                Officers
              </TabsTrigger>
              <TabsTrigger
                value="mediation"
                className="relative rounded-none border-0 bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground shadow-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:shadow-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100"
              >
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
