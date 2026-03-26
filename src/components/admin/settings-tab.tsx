'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Shield, User } from "lucide-react";

const categories = [
  "Violence or Threats",
  "Harassment & Bullying",
  "Online & Cyber Issues",
  "Public Disturbance",
  "Property & Damage",
  "Noise Complaint",
  "Environmental Concerns",
  "Community Safety",
  "Others",
];

export function SettingsTab() {
  return (
    <div className="space-y-6">
      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
          <CardDescription>Configure AI thresholds and automation settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="high-priority">High Priority Threshold</Label>
                    <div className="flex items-center gap-2">
                        <Input id="high-priority" defaultValue="7.0" className="w-24" />
                        <span className="text-sm text-muted-foreground">Score ≥ 7.0 = High Priority</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="critical-priority">Critical Priority Threshold</Label>
                    <div className="flex items-center gap-2">
                        <Input id="critical-priority" defaultValue="9.0" className="w-24" />
                        <span className="text-sm text-muted-foreground">Score ≥ 9.0 = Critical</span>
                    </div>
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="auto-confidence">Auto-categorization Confidence</Label>
                <div className="flex items-center gap-2">
                    <Input id="auto-confidence" defaultValue="85" className="w-24" />
                    <span className="text-sm text-muted-foreground">Minimum confidence: 85%</span>
                </div>
            </div>

            <div className="pt-2">
                <Button className="bg-slate-900 text-white hover:bg-slate-800">
                    Save AI Settings
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Category Configuration</CardTitle>
          <CardDescription>Manage incident categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category) => (
                <div key={category} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <span className="font-medium">{category}</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8">Edit</Button>
                        <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50">Remove</Button>
                    </div>
                </div>
            ))}
            <div className="pt-4">
                <Button className="bg-slate-900 text-white hover:bg-slate-800">
                    Add New Category
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Manage access levels and capabilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-slate-900" />
                <h3 className="font-semibold text-lg">Admin</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" /> <span className="text-sm text-foreground">Full System Access</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" /> <span className="text-sm text-foreground">User Management</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" /> <span className="text-sm text-foreground">Edit Settings</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" /> <span className="text-sm text-foreground">Export Data</span>
                </div>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-slate-900" />
                <h3 className="font-semibold text-lg">Officer</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" /> <span className="text-sm text-foreground">View Cases</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" /> <span className="text-sm text-foreground">Update Status</span>
                </div>
                <div className="flex items-center gap-2 text-red-500">
                    <X className="h-4 w-4" /> <span className="text-sm text-foreground">Delete Cases</span>
                </div>
                <div className="flex items-center gap-2 text-red-500">
                    <X className="h-4 w-4" /> <span className="text-sm text-foreground">User Management</span>
                </div>
            </div>
          </div>
          
          <div className="pt-2">
            <Button className="bg-slate-900 text-white hover:bg-slate-800">
                Manage Permissions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
