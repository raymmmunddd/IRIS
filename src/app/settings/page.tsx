"use client"

import { useEffect, useState } from "react"
import { KeyRound, Save, ShieldCheck } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getProfileSecurity, updatePasswordTimestamp } from "@/lib/profile"

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [lastUpdated, setLastUpdated] = useState("Never")

  useEffect(() => {
    const security = getProfileSecurity()
    setLastUpdated(security.passwordLastUpdated)
  }, [])

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage("Please complete all password fields.")
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage("New password should be at least 8 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New password and confirm password do not match.")
      return
    }

    updatePasswordTimestamp()
    setLastUpdated(new Date().toLocaleString())
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setPasswordMessage("Password updated successfully.")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <DashboardHeader
          title="Account Settings"
          description="Manage your password and security preferences"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4 text-primary" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  className="focus-visible:ring-0 focus-visible:ring-transparent"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  className="focus-visible:ring-0 focus-visible:ring-transparent"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="focus-visible:ring-0 focus-visible:ring-transparent"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handlePasswordChange} className="gap-2 rounded-lg">
                  <Save className="h-4 w-4" />
                  Update Password
                </Button>
                <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
              </div>

              {passwordMessage && (
                <p className="text-sm text-foreground">{passwordMessage}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Security Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Not configured</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-sm font-medium">Active Session</p>
                <p className="text-xs text-muted-foreground">Current browser session is secured</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-sm font-medium">Password Status</p>
                <p className="text-xs text-muted-foreground">Review and rotate passwords regularly</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
