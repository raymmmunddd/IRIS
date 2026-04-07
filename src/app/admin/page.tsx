'use client';

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTab } from "@/components/admin/users-tab";
import { AnnouncementsTab } from "@/components/admin/announcements-tab";
import { PublicDataTab } from "@/components/admin/public-data-tab";
import { AuditLogsTab } from "@/components/admin/audit-logs-tab";
import { SettingsTab } from "@/components/admin/settings-tab";
import { Users, Megaphone, Eye, FileText, Settings } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <DashboardHeader
          title="Administration"
          description="System control and governance settings"
        />

        <Tabs defaultValue="users" className="space-y-6">
          <div className="rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)]/95 p-3 shadow-sm">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-xl bg-transparent p-0 lg:grid-cols-5">
            <TabsTrigger
              value="users"
              className="gap-2 rounded-lg border border-transparent px-3 py-2.5 data-[state=active]:border-[var(--iris-border)] data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="announcements"
              className="gap-2 rounded-lg border border-transparent px-3 py-2.5 data-[state=active]:border-[var(--iris-border)] data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Megaphone className="h-4 w-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger
              value="public-data"
              className="gap-2 rounded-lg border border-transparent px-3 py-2.5 data-[state=active]:border-[var(--iris-border)] data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Eye className="h-4 w-4" />
              Public Data
            </TabsTrigger>
            <TabsTrigger
              value="audit-logs"
              className="gap-2 rounded-lg border border-transparent px-3 py-2.5 data-[state=active]:border-[var(--iris-border)] data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <FileText className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="gap-2 rounded-lg border border-transparent px-3 py-2.5 data-[state=active]:border-[var(--iris-border)] data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users" className="space-y-4">
            <UsersTab />
          </TabsContent>
          
          <TabsContent value="announcements" className="space-y-4">
            <AnnouncementsTab />
          </TabsContent>
          
          <TabsContent value="public-data" className="space-y-4">
            <PublicDataTab />
          </TabsContent>

          <TabsContent value="audit-logs" className="space-y-4">
            <AuditLogsTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
