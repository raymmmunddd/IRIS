export const dynamic = 'force-dynamic'
'use client';

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { PageHeader } from "@/components/ui/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTab } from "@/components/admin/users-tab";
import { AnnouncementsTab } from "@/components/admin/announcements-tab";
import { PublicDataTab } from "@/components/admin/public-data-tab";
import { AuditLogsTab } from "@/components/admin/audit-logs-tab";
import { SettingsTab } from "@/components/admin/settings-tab";
import { Users, Megaphone, Eye, FileText, Settings, ShieldCheck } from "lucide-react";

export default function AdminPage() {
  const [adminData, setAdminData] = useState<{
    users: Parameters<typeof UsersTab>[0]["users"]
    announcements: Parameters<typeof AnnouncementsTab>[0]["announcements"]
    auditLogs: Parameters<typeof AuditLogsTab>[0]["logs"]
  }>({ users: [], announcements: [], auditLogs: [] })

  async function loadAdminData() {
    try {
      const response = await fetch("/api/admin")
      const result = await response.json()
      if (result.success) setAdminData(result.data)
    } catch (error) {
      console.error("Failed to load admin data:", error)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex h-screen shrink-0">
        <DashboardSidebar />
      </div>

      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Administration"
          description="Manage system users, settings, and overall barangay system control."
          icon={<ShieldCheck className="h-5 w-5 text-white" />}
        />

        <Tabs defaultValue="users" className="space-y-4 sm:space-y-6">
          <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0 overflow-x-auto">
            <TabsTrigger
              value="users"
              className="relative rounded-none border-0 bg-transparent px-2 sm:px-4 py-3 text-sm font-medium text-muted-foreground shadow-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:shadow-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100 flex items-center gap-2 shrink-0"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="announcements"
              className="relative rounded-none border-0 bg-transparent px-2 sm:px-4 py-3 text-sm font-medium text-muted-foreground shadow-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:shadow-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100 flex items-center gap-2 shrink-0"
            >
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">Announcements</span>
            </TabsTrigger>
            <TabsTrigger
              value="public-data"
              className="relative rounded-none border-0 bg-transparent px-2 sm:px-4 py-3 text-sm font-medium text-muted-foreground shadow-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:shadow-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100 flex items-center gap-2 shrink-0"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Public Data</span>
            </TabsTrigger>
            <TabsTrigger
              value="audit-logs"
              className="relative rounded-none border-0 bg-transparent px-2 sm:px-4 py-3 text-sm font-medium text-muted-foreground shadow-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:shadow-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100 flex items-center gap-2 shrink-0"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Audit Logs</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="relative rounded-none border-0 bg-transparent px-2 sm:px-4 py-3 text-sm font-medium text-muted-foreground shadow-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:shadow-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100 flex items-center gap-2 shrink-0"
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UsersTab users={adminData.users} onUpdated={loadAdminData} />
          </TabsContent>
          
          <TabsContent value="announcements" className="space-y-4">
            <AnnouncementsTab announcements={adminData.announcements} onUpdated={loadAdminData} />
          </TabsContent>
          
          <TabsContent value="public-data" className="space-y-4">
            <PublicDataTab />
          </TabsContent>

          <TabsContent value="audit-logs" className="space-y-4">
            <AuditLogsTab logs={adminData.auditLogs} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
