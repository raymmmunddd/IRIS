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
  const [categories, setCategories] = useState<{ active: string[]; archived: string[] }>({ active: [], archived: [] })
  const [permissions, setPermissions] = useState<RolePermission[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [settingsError, setSettingsError] = useState("")
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoadingSettings(true)
        setSettingsError("")
        const response = await fetch("/api/admin/settings")
        const result = await response.json()
        if (!response.ok || !result.success || !result.data) throw new Error(result.message || "Unable to load admin settings.")
        setAiConfig(result.data.aiConfig)
        const savedCategories = result.data.categories
        setCategories(Array.isArray(savedCategories)
          ? { active: savedCategories, archived: [] }
          : { active: savedCategories.active ?? [], archived: savedCategories.archived ?? [] })
        setPermissions(result.data.permissions)
      } catch (error) {
        setSettingsError(error instanceof Error ? error.message : "Unable to load admin settings.")
      } finally {
        setIsLoadingSettings(false)
      }
    }

    loadSettings()
  }, [reloadCount])

  async function saveSection(section: "aiConfig" | "categories" | "permissions", value: unknown, message: string) {
    setIsSavingSettings(true)
    setSettingsError("")
    setStatusMessage("")
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, value }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to save settings.")
      setStatusMessage(message)
      return true
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : "Unable to save settings.")
      return false
    } finally {
      setIsSavingSettings(false)
    }
  }

  async function archiveCategory(category: string) {
    const previous = categories
    const next = {
      active: categories.active.filter((item) => item !== category),
      archived: [...categories.archived, category],
    }
    setCategories(next)
    if (!await saveSection("categories", next, "Category archived.")) setCategories(previous)
  }

  async function restoreCategory(category: string) {
    const previous = categories
    const next = {
      active: [...categories.active, category],
      archived: categories.archived.filter((item) => item !== category),
    }
    setCategories(next)
    if (!await saveSection("categories", next, "Category restored.")) setCategories(previous)
  }

  async function addCategory() {
    const value = newCategory.trim()
    if (!value) return
    if (categories.active.includes(value) || categories.archived.includes(value)) return
    const previous = categories
    const next = { ...categories, active: [...categories.active, value] }
    setCategories(next)
    setNewCategory("")
    if (!await saveSection("categories", next, "Categories saved.")) setCategories(previous)
  }

  if (isLoadingSettings) {
    return <div aria-label="Loading settings" className="space-y-4">{[0, 1, 2].map((item) => <div key={item} className="h-40 animate-pulse rounded-xl bg-muted" />)}</div>
  }

  return (
    <div className="space-y-6">
      {settingsError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <span>{settingsError}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => setReloadCount((count) => count + 1)}>Retry loading settings</Button>
        </div>
      )}
      {statusMessage && <p role="status" className="text-sm text-emerald-700">{statusMessage}</p>}
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

          <Button className="rounded-lg bg-slate-900 text-white hover:bg-slate-800" disabled={isSavingSettings} onClick={() => saveSection("aiConfig", aiConfig, "AI settings saved.")}>
            {isSavingSettings ? "Saving..." : "Save AI Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95 shadow-sm">
        <CardHeader>
          <CardTitle>Category Configuration</CardTitle>
          <CardDescription>Manage incident categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.active.map((category) => (
            <div key={category} className="flex items-center justify-between rounded-xl border border-[var(--iris-border)] bg-white p-3 transition-colors hover:bg-accent/50">
              <span className="font-medium">{category}</span>
              <Button variant="ghost" size="sm" className="h-8 rounded-lg" disabled={isSavingSettings} onClick={() => archiveCategory(category)} title={`Archive ${category}`}>
                Archive
              </Button>
            </div>
          ))}

          {categories.archived.length > 0 && (
            <div className="mt-5 space-y-2 border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Archived categories</h3>
              {categories.archived.map((category) => (
                <div key={category} className="flex items-center justify-between rounded-xl border border-dashed border-[var(--iris-border)] bg-muted/40 p-3">
                  <span className="font-medium text-muted-foreground">{category}</span>
                  <Button variant="outline" size="sm" className="h-8 rounded-lg" disabled={isSavingSettings} onClick={() => restoreCategory(category)} title={`Restore ${category}`}>
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="New category name" />
            <Button className="rounded-lg bg-slate-900 text-white hover:bg-slate-800" disabled={isSavingSettings} onClick={addCategory}>
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

          <Button className="rounded-lg bg-slate-900 text-white hover:bg-slate-800" onClick={() => setIsPermissionsOpen(true)}>
            Manage Permissions
          </Button>

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
              disabled={isSavingSettings}
              onClick={async () => {
                if (await saveSection("permissions", permissions, "Permission settings saved.")) setIsPermissionsOpen(false)
              }}
            >
              {isSavingSettings ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
