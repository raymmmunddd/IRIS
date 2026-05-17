"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, MapPin, TrendingUp } from "lucide-react";
import { getAuthUser, getRoleLandingPath, isRoleAuthorized } from "@/lib/auth";
import { BpatSidebar } from "@/components/bpat/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { StreetMap } from "@/components/reports/street-map";

type Category = "All" | "Public Disturbance" | "Community Dispute" | "Violence or Threats" | "Property & Theft" | "Health";

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="hidden lg:flex h-screen shrink-0">
        <BpatSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-[var(--sidebar-bg)] px-4 pb-5 pt-4 text-[var(--sidebar-foreground)] shadow-sm lg:hidden">
          <div className="mx-auto w-full max-w-md">
            <Link
              href="/bpat-officers"
              className="mb-3 inline-flex items-center gap-1.5 text-xs text-[var(--sidebar-muted)] transition-colors hover:text-[var(--sidebar-foreground)]"
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
                <Map className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="hidden lg:block">
            <PageHeader
              title="Incident Map"
              description="Monitor coverage zones, live incident clusters, and patrol deployment across the barangay."
              icon={<Map className="h-5 w-5 text-white" />}
            />
          </div>

          <div className="mx-auto w-full max-w-md space-y-4 lg:max-w-6xl lg:space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
              <section className="order-2 space-y-4 lg:order-1">
                <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6 shadow-sm">
                  <div className="absolute right-6 top-6 flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                    <Navigation className="h-3 w-3" />
                    Live Tracking
                  </div>
                  <h2 className="text-lg font-semibold">Barangay Iris Coverage Map</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Monitor incident clusters, patrol zones, and response coverage across precinct boundaries.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      { label: "Active Incidents", value: "18", icon: MapPin, color: "text-emerald-600" },
                      { label: "On Patrol", value: "6", icon: MapPinned, color: "text-sky-600" },
                      { label: "Response ETA", value: "12m", icon: Clock, color: "text-amber-600" },
                      { label: "Zones Covered", value: "4", icon: Layers, color: "text-indigo-600" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-border bg-white/80 p-3">
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        <p className="mt-2 text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-lg font-semibold text-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground">Recent Alerts</p>
                  <div className="mt-3 space-y-3 text-sm">
                    {[
                      { title: "Road obstruction reported", time: "10 min ago", badge: "Urgent" },
                      { title: "Noise complaint follow-up", time: "22 min ago", badge: "Assigned" },
                      { title: "Community request incoming", time: "35 min ago", badge: "Unassigned" },
                    ].map((alert) => (
                      <div key={alert.title} className="flex items-start justify-between gap-2 border-b border-border pb-3 last:border-b-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">{alert.time}</p>
                        </div>
                        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          {alert.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <aside className="order-1 space-y-4 lg:order-2">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Quick Filters</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["All", "Urgent", "Assigned", "Unassigned"].map((item) => (
                      <button
                        key={item}
                        className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-[var(--primary)]/40"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground shadow-sm">
                  Tip: Tap an incident cluster on the live map to view nearby units and recommended routes.
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
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
