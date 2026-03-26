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
        <div className="pb-6">
            <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
            <p className="text-muted-foreground">System control and governance settings</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="public-data" className="gap-2">
              <Eye className="h-4 w-4" />
              Public Data
            </TabsTrigger>
            <TabsTrigger value="audit-logs" className="gap-2">
              <FileText className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

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
