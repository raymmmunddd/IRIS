"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, MapPin, RefreshCw } from "lucide-react"
import { getAuthUser, getRoleLandingPath, isRoleAuthorized } from "@/lib/auth"
import { BpatSidebar } from "@/components/bpat/sidebar"
import { PageHeader } from "@/components/ui/page-header"
import { StreetMap, type MapIncident } from "@/components/reports/street-map"

type MapData = {
  totalCases: number
  geocodedCases: number
  streetStats: Array<{ name: string; cases: number; urgent: number }>
  mapIncidents: MapIncident[]
}

export default function BpatMapPage() {
  const router = useRouter()
  const [data, setData] = useState<MapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  const loadMapData = useCallback(async (signal: AbortSignal): Promise<MapData> => {
    const response = await fetch("/api/bpat-officers/map", { signal })
    const result = await response.json()
    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || "Unable to load incident locations.")
    }
    return result.data
  }, [])

  useEffect(() => {
    const user = getAuthUser()
    if (!user) {
      router.replace("/login?role=bpat")
      return
    }
    if (!isRoleAuthorized(["bpat"])) {
      router.replace(getRoleLandingPath(user.role))
      return
    }

    const controller = new AbortController()
    async function load() {
      try {
        const loadedData = await loadMapData(controller.signal)
        setData(loadedData)
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load incident locations.")
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [loadMapData, reloadKey, router])

  return (
    <div className="flex min-h-dvh bg-background text-foreground lg:h-dvh lg:overflow-hidden">
      <BpatSidebar />
      <main className="min-w-0 flex-1 p-4 pt-16 sm:p-6 sm:pt-16 lg:min-h-0 lg:overflow-y-auto lg:p-8">
        <header className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-sm lg:hidden">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">BPAT Mobile Desk</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><MapPin className="h-5 w-5" /></span>
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight">Incident Map</h1>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Verified report locations in Olongapo City.</p>
            </div>
          </div>
        </header>

        <div className="hidden lg:block">
          <PageHeader
            title="Incident Map"
            description="View reported locations with verified coordinates across Olongapo City."
            icon={<MapPin className="h-5 w-5 text-white" />}
          />
        </div>

        {error && (
          <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <span>{error}</span>
            <button type="button" onClick={() => { setLoading(true); setError(""); setReloadKey((key) => key + 1) }} className="inline-flex items-center gap-2 font-semibold underline">
              <RefreshCw className="h-4 w-4" />Retry
            </button>
          </div>
        )}

        {loading ? (
          <div aria-label="Loading incident map" className="mt-5 space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((item) => <div key={item} className={`rounded-2xl border border-border bg-card p-4 ${item === 2 ? "col-span-2 sm:col-span-1" : ""}`}><div className="h-4 w-2/3 animate-pulse rounded bg-muted" /><div className="mt-3 h-7 w-1/3 animate-pulse rounded bg-muted" /></div>)}
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.75fr)]">
              <div className="h-[22rem] animate-pulse rounded-2xl bg-muted sm:h-[26rem] xl:h-[34rem]" />
              <div className="h-72 animate-pulse rounded-2xl bg-muted xl:h-[34rem]" />
            </div>
          </div>
        ) : data ? (
          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: "Active cases", value: data.totalCases },
                { label: "With verified coordinates", value: data.geocodedCases },
                { label: "Reported streets", value: data.streetStats.length },
              ].map((stat) => (
                <div key={stat.label} className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm last:col-span-2 sm:last:col-span-1">
                  <p className="text-xs leading-tight text-muted-foreground sm:text-sm">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.75fr)]">
              <StreetMap
                incidents={data.mapIncidents}
                title="Incident locations"
                description="Olongapo City · markers are plotted as [latitude, longitude] from saved incident coordinates"
                className="min-h-[22rem] sm:min-h-[26rem] xl:min-h-[34rem]"
              />
              <section className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <h2 className="font-semibold">Cases by reported street</h2>
                </div>
                {data.streetStats.length ? (
                  <div className="space-y-2">
                    {data.streetStats.map((street) => (
                      <div key={street.name} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5">
                        <span className="truncate text-sm font-medium">{street.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{street.cases} cases{street.urgent ? ` · ${street.urgent} urgent` : ""}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">No active cases have been reported yet.</p>
                )}
                <p className="mt-4 text-xs text-muted-foreground">Cases without coordinates remain in the list but are not placed at an estimated map point.</p>
              </section>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
