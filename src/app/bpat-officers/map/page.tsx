"use client"
export const dynamic = 'force-dynamic'

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, Clock, Layers, Map, MapPin, Navigation, TrendingUp } from "lucide-react"

import { getAuthUser, getRoleLandingPath, isRoleAuthorized } from "@/lib/auth"
import { BpatSidebar } from "@/components/bpat/sidebar"
import { PageHeader } from "@/components/ui/page-header"
import { StreetMap, type StreetHeatStat } from "@/components/reports/street-map"

type CategoryBreakdown = {
  label: string
  count: number
  pct: number
  color: string
}

type Hotspot = {
  street: string
  issue: string
  level: "Critical" | "High" | "Medium" | "Low"
}

type BpatMapData = {
  streetStats: (StreetHeatStat & {
    trend?: string
    color?: string
    purok?: number | null
  })[]
  categoryBreakdown: CategoryBreakdown[]
  recentHotspots: Hotspot[]
}

const LEVEL_STYLES: Record<Hotspot["level"], string> = {
  Critical: "border-red-200 bg-red-50 text-red-800",
  High: "border-orange-200 bg-orange-50 text-orange-800",
  Medium: "border-amber-200 bg-amber-50 text-amber-800",
  Low: "border-emerald-200 bg-emerald-50 text-emerald-800",
}

export default function BpatIncidentMapPage() {
  const router = useRouter()
  const [data, setData] = useState<BpatMapData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = getAuthUser()

    if (!user) {
      router.push("/login?role=bpat")
      return
    }

    if (!isRoleAuthorized(["bpat"])) {
      router.push(getRoleLandingPath(user.role))
      return
    }

    async function loadMapData() {
      try {
        const response = await fetch("/api/bpat-officers/map")
        const result = await response.json()
        if (result.success) setData(result.data)
      } catch (error) {
        console.error("Failed to load BPAT map data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMapData()
  }, [router])

  const streetStats = useMemo(() => data?.streetStats ?? [], [data?.streetStats])
  const categoryBreakdown = data?.categoryBreakdown ?? []
  const recentHotspots = data?.recentHotspots ?? []

  const totals = useMemo(
    () => ({
      cases: streetStats.reduce((sum, item) => sum + item.cases, 0),
      urgent: streetStats.reduce((sum, item) => sum + (item.urgent ?? 0), 0),
      maxCases: Math.max(...streetStats.map((item) => item.cases), 1),
    }),
    [streetStats]
  )

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
              description="Monitor East Tapinac hotspots, active case density, and patrol priorities by street."
              icon={<Map className="h-5 w-5 text-white" />}
            />
          </div>

          <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
            <div className="grid gap-6 lg:grid-cols-[1.65fr_0.9fr]">
              <section className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm font-semibold">Live Location Intelligence</p>
                    <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      East Tapinac
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                      { label: "Active Incidents", value: totals.cases, icon: MapPin, color: "text-emerald-600" },
                      { label: "Urgent", value: totals.urgent, icon: AlertTriangle, color: "text-red-600" },
                      { label: "Mapped Streets", value: streetStats.length, icon: Layers, color: "text-sky-600" },
                      { label: "Refresh", value: isLoading ? "Loading" : "Live", icon: Clock, color: "text-amber-600" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-border bg-background p-3">
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        <p className="mt-2 text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-lg font-semibold text-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-[420px]">
                  <StreetMap data={streetStats} />
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="mb-3 text-sm font-bold text-foreground">Cases by Street</p>
                  <div className="space-y-2.5">
                    {[...streetStats].sort((a, b) => b.cases - a.cases).map((street) => (
                      <div key={street.name} className="grid grid-cols-[90px_minmax(0,1fr)_40px_44px] items-center gap-3">
                        <span className="truncate text-xs font-semibold text-foreground">{street.name}</span>
                        <div className="relative h-5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`absolute inset-y-0 left-0 rounded-full ${street.color ?? "bg-primary"} transition-all`}
                            style={{ width: `${(street.cases / totals.maxCases) * 100}%` }}
                          />
                        </div>
                        <span className="text-right text-xs font-bold text-foreground">{street.cases}</span>
                        <span className="text-right text-[11px] font-semibold text-muted-foreground">{street.trend ?? "0"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <aside className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="mb-3 text-sm font-bold text-foreground">Incident Categories</p>
                  <div className="space-y-2">
                    {categoryBreakdown.map((category) => (
                      <div key={category.label} className="flex items-center gap-3">
                        <span className="flex-1 text-xs text-muted-foreground">{category.label}</span>
                        <div className="relative h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`absolute inset-y-0 left-0 rounded-full ${category.color}`}
                            style={{ width: `${category.pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs font-semibold text-foreground">{category.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-bold text-foreground">Active Hotspots</p>
                  </div>
                  <div className="space-y-2">
                    {recentHotspots.length ? (
                      recentHotspots.map((hotspot) => (
                        <div key={hotspot.street} className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${LEVEL_STYLES[hotspot.level]}`}>
                          <div>
                            <p className="text-xs font-bold">{hotspot.street}</p>
                            <p className="text-[11px]">{hotspot.issue}</p>
                          </div>
                          <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold">
                            {hotspot.level}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
                        No active hotspots recorded.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Week Summary</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {totals.cases} active cases across {streetStats.length} mapped streets.{" "}
                      {streetStats[0]?.name ?? "No street"} is currently the highest-density area.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
