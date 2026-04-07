'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const categories = [
  "Violence or Threats",
  "Harassment & Bullying",
  "Online & Cyber Issues",
  "Property & Damage",
  "Environmental Concerns",
  "Others",
  "Public Disturbance",
  "Noise Complaint",
  "Community Safety",
];

export function PublicDataTab() {
  return (
    <div className="space-y-6">
      <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95 shadow-sm">
        <CardHeader>
          <CardTitle>Public Transparency Settings</CardTitle>
          <CardDescription>Control what data is visible on the public dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Public Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-[var(--iris-border)] bg-white p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Display Total Case Count</Label>
                  <p className="text-sm text-muted-foreground">
                    Show total number of cases on public dashboard
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[var(--iris-border)] bg-white p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Resolution Rate</Label>
                  <p className="text-sm text-muted-foreground">
                    Display resolution percentage publicly
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[var(--iris-border)] bg-white p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Category Breakdown</Label>
                  <p className="text-sm text-muted-foreground">
                    Show cases by category to public
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Hidden Categories</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select sensitive categories to hide from public statistics
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <div key={category} className="flex items-center justify-between space-x-2">
                    <Label htmlFor={`hide-${category}`} className="flex-1">{category}</Label>
                    <Switch id={`hide-${category}`} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            <Button className="rounded-lg bg-slate-900 text-white hover:bg-slate-800">
                Save Public Data Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
