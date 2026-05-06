"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, MapPin, TrendingUp } from "lucide-react";
import { getAuthUser, getRoleLandingPath, isRoleAuthorized } from "@/lib/auth";
import { StreetMap } from "@/components/reports/street-map";

type Category = "All" | "Public Disturbance" | "Community Dispute" | "Violence or Threats" | "Property & Theft" | "Health";

const FALLBACK_STREET_STATS = [
  { name: "Rizal Avenue", cases: 12, urgent: 1, trend: "+2", color: "bg-amber-400" },
  { name: "Del Pilar Street", cases: 21, urgent: 3, trend: "+5", color: "bg-red-500" },
  { name: "Mabini Street", cases: 18, urgent: 2, trend: "+1", color: "bg-orange-400" },
  { name: "Bonifacio Street", cases: 9, urgent: 0, trend: "-1", color: "bg-yellow-300" },
  { name: "Sampaguita Street", cases: 15, urgent: 1, trend: "+3", color: "bg-amber-500" },
  { name: "Luna Street", cases: 7, urgent: 0, trend: "0", color: "bg-green-400" },
];

const FALLBACK_CATEGORY_BREAKDOWN = [
  { label: "Public Disturbance", count: 28, pct: 33, color: "bg-[var(--primary)]" },
  { label: "Community Dispute",  count: 22, pct: 26, color: "bg-blue-400" },
  { label: "Violence or Threats",count: 14, pct: 17, color: "bg-red-500" },
  { label: "Property & Theft",   count: 12, pct: 14, color: "bg-amber-500" },
  { label: "Health",             count: 6,  pct:  7, color: "bg-emerald-500" },
  { label: "Other",              count: 3,  pct:  4, color: "bg-slate-400" },
];

const FALLBACK_RECENT_HOTSPOTS = [
  { street: "Del Pilar Street", issue: "3 violence-related cases this week", level: "Critical" },
  { street: "Mabini Street", issue: "Night disturbances spiking", level: "High" },
  { street: "Sampaguita Street", issue: "Mediation backlog forming", level: "Medium" },
];

const LEVEL_STYLES: Record<string, string> = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-amber-50 text-amber-700 border-amber-200",
  Medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const CATEGORIES: Category[] = ["All", "Public Disturbance", "Community Dispute", "Violence or Threats", "Property & Theft", "Health"];

export default function IncidentMapPage() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("All");
  const [streetStats, setStreetStats] = useState(FALLBACK_STREET_STATS);
  const [categoryBreakdown, setCategoryBreakdown] = useState(FALLBACK_CATEGORY_BREAKDOWN);
  const [recentHotspots, setRecentHotspots] = useState(FALLBACK_RECENT_HOTSPOTS);

  useEffect(() => {
    const user = getAuthUser();
    if (!user) { router.push("/login"); return; }
    if (!isRoleAuthorized(["bpat"])) {
      router.push(getRoleLandingPath(user.role));
      return;
    }

    fetch("/api/bpat-officers/map")
      .then((response) => response.json())
      .then((result) => {
        if (result.success && result.data) {
          if (result.data.streetStats.length) setStreetStats(result.data.streetStats);
          if (result.data.categoryBreakdown.length) setCategoryBreakdown(result.data.categoryBreakdown);
          if (result.data.recentHotspots.length) setRecentHotspots(result.data.recentHotspots);
        }
      })
      .catch(() => undefined);
  }, [router]);

  const totalCases = streetStats.reduce((sum, p) => sum + p.cases, 0);
  const totalUrgent = streetStats.reduce((sum, p) => sum + p.urgent, 0);
  const maxCases = Math.max(...streetStats.map((p) => p.cases), 1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-[var(--sidebar-bg)] px-4 pb-5 pt-4 text-[var(--sidebar-foreground)] shadow-sm">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/bpat-officers"
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-[var(--sidebar-muted)] hover:text-[var(--sidebar-foreground)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Field Ops
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--sidebar-muted)]">BPAT Mobile Desk</p>
              <h1 className="mt-1 text-xl font-bold">Incident Map</h1>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-md space-y-4 px-4 pb-8 pt-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total Cases", value: totalCases, color: "text-[var(--primary)]", bg: "bg-[var(--primary-light)]" },
            { label: "Urgent", value: totalUrgent, color: "text-red-600", bg: "bg-red-50" },
            { label: "Streets", value: streetStats.length, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl ${s.bg} border border-border px-2 py-3 text-center`}>
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                category === c
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-border bg-card text-muted-foreground hover:border-[var(--primary)]/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Heatmap */}
        <div className="relative z-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <MapPin className="h-4 w-4 text-[var(--primary)]" />
            <p className="text-sm font-semibold">Street Incident Heatmap</p>
            <span className="ml-auto text-xs text-muted-foreground">East Tapinac</span>
          </div>
          <div className="relative overflow-hidden h-64">
            <StreetMap />
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 border-t border-border px-4 py-2.5">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm bg-green-400" /> Low
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm bg-yellow-400" /> Moderate
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm bg-orange-400" /> High
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> Critical
            </span>
          </div>
        </div>

        {/* Street breakdown */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="mb-3 text-sm font-bold text-foreground">Cases by Street</p>
          <div className="space-y-2.5">
            {[...streetStats].sort((a, b) => b.cases - a.cases).map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-16 text-xs font-semibold text-foreground">{p.name}</span>
                <div className="relative flex-1 rounded-full bg-muted h-5 overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${p.color} transition-all`}
                    style={{ width: `${(p.cases / maxCases) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs font-bold text-foreground">{p.cases}</span>
                <span
                  className={`w-8 text-right text-[11px] font-semibold ${
                    p.trend.startsWith("+") ? "text-red-500" : p.trend === "0" ? "text-muted-foreground" : "text-emerald-600"
                  }`}
                >
                  {p.trend}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Trend column = change vs last week</p>
        </div>

        {/* Category breakdown */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="mb-3 text-sm font-bold text-foreground">Incident Categories</p>
          <div className="space-y-2">
            {categoryBreakdown.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="flex-1 text-xs text-muted-foreground">{c.label}</span>
                <div className="relative h-2 w-24 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${c.color}`}
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-semibold text-foreground">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hotspot alerts */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-bold text-foreground">Active Hotspots</p>
          </div>
          <div className="space-y-2">
            {recentHotspots.map((h) => (
              <div key={h.street} className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${LEVEL_STYLES[h.level]}`}>
                <div>
                  <p className="text-xs font-bold">{h.street}</p>
                  <p className="text-[11px]">{h.issue}</p>
                </div>
                <span className="flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold">
                  {h.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly trend note */}
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--primary)]" />
          <div>
            <p className="text-xs font-semibold text-foreground">Week Summary</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {totalCases} active cases across {streetStats.length} streets. {streetStats[0]?.name ?? "No street"} remains the highest-density area.
              {totalUrgent} urgent case{totalUrgent !== 1 ? "s" : ""} require immediate response.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
