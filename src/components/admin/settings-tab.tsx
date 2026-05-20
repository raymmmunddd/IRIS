'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Plus, Shield, User, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type AiConfig = {
  highPriorityThreshold: string
  criticalPriorityThreshold: string
  autoConfidence: string
}

type RolePermission = {
  role: string
  allowed: string[]
  denied: string[]
}

export function SettingsTab() {
  const [aiConfig, setAiConfig] = useState<AiConfig>({
    highPriorityThreshold: "7.0",
    criticalPriorityThreshold: "9.0",
    autoConfidence: "85",
  })
  const [categories, setCategories] = useState<string[]>([])
  const [permissions, setPermissions] = useState<RolePermission[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/settings")
        const result = await response.json()
        if (result.success && result.data) {
          setAiConfig(result.data.aiConfig)
          setCategories(result.data.categories)
          setPermissions(result.data.permissions)
        }
      } catch (error) {
        console.error("Failed to load admin settings:", error)
      }
    }

    loadSettings()
  }, [])

  async function saveSection(section: "aiConfig" | "categories" | "permissions", value: unknown, message: string) {
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, value }),
    })
    const result = await response.json()
    if (result.success) {
      setStatusMessage(message)
    }
  }

  function removeCategory(category: string) {
    const next = categories.filter((item) => item !== category)
    setCategories(next)
    saveSection("categories", next, "Categories saved.")
  }

  function addCategory() {
    const value = newCategory.trim()
    if (!value) return
    const next = [...categories, value]
    setCategories(next)
    setNewCategory("")
    saveSection("categories", next, "Categories saved.")
  }

  return (
    <div className="space-y-6">
      <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95 shadow-sm">
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
          <CardDescription>Configure AI thresholds and automation settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="high-priority">High Priority Threshold</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="high-priority"
                  value={aiConfig.highPriorityThreshold}
                  onChange={(event) => setAiConfig((current) => ({ ...current, highPriorityThreshold: event.target.value }))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">Score {">="} threshold = High Priority</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="critical-priority">Critical Priority Threshold</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="critical-priority"
                  value={aiConfig.criticalPriorityThreshold}
                  onChange={(event) => setAiConfig((current) => ({ ...current, criticalPriorityThreshold: event.target.value }))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">Score {">="} threshold = Critical</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auto-confidence">Auto-categorization Confidence</Label>
            <div className="flex items-center gap-2">
              <Input
                id="auto-confidence"
                value={aiConfig.autoConfidence}
                onChange={(event) => setAiConfig((current) => ({ ...current, autoConfidence: event.target.value }))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">Minimum confidence percentage</span>
            </div>
          </div>

          <Button className="rounded-lg bg-slate-900 text-white hover:bg-slate-800" onClick={() => saveSection("aiConfig", aiConfig, "AI settings saved.")}>
            Save AI Settings
          </Button>
        </CardContent>
      </Card>

      <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95 shadow-sm">
        <CardHeader>
          <CardTitle>Category Configuration</CardTitle>
          <CardDescription>Manage incident categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center justify-between rounded-xl border border-[var(--iris-border)] bg-white p-3 transition-colors hover:bg-accent/50">
              <span className="font-medium">{category}</span>
              <Button variant="ghost" size="sm" className="h-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700" onClick={() => removeCategory(category)}>
                Remove
              </Button>
            </div>
          ))}

          <div className="flex gap-2 pt-4">
            <Input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="New category name" />
            <Button className="rounded-lg bg-slate-900 text-white hover:bg-slate-800" onClick={addCategory}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95 shadow-sm">
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Manage access levels and capabilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {permissions.map((permission) => (
            <div key={permission.role} className="space-y-4 rounded-xl border border-[var(--iris-border)] bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                {permission.role === "Admin" ? <Shield className="h-5 w-5 text-slate-900" /> : <User className="h-5 w-5 text-slate-900" />}
                <h3 className="text-lg font-semibold">{permission.role}</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {permission.allowed.map((item) => (
                  <div key={`${permission.role}-${item}`} className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" /> <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
                {permission.denied.map((item) => (
                  <div key={`${permission.role}-${item}`} className="flex items-center gap-2 text-red-500">
                    <X className="h-4 w-4" /> <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* <Button className="rounded-lg bg-slate-900 text-white hover:bg-slate-800" onClick={() => setIsPermissionsOpen(true)}>
            Manage Permissions
          </Button> */}

          {statusMessage && <p className="text-sm text-muted-foreground">{statusMessage}</p>}
        </CardContent>
      </Card>

      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Permission editing is still static for now, but this modal is wired and the current permission matrix is persisted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Admin retains full system access, export access, user management, and settings access.</p>
            <p>Officer retains case visibility and status updates without delete or user-management capabilities.</p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                saveSection("permissions", permissions, "Permission settings saved.")
                setIsPermissionsOpen(false)
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
