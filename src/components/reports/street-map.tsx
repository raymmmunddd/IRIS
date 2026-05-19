"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { MapPin } from "lucide-react"
import type { LatLngBoundsExpression, LatLngExpression, Layer, Map as LeafletMap } from "leaflet"

import {
  EAST_TAPINAC_BARANGAY,
  EAST_TAPINAC_BOUNDS,
  EAST_TAPINAC_CENTER,
  EAST_TAPINAC_STREETS,
  findEastTapinacStreet,
  normalizeStreetName,
} from "@/lib/east-tapinac-geo"

export type StreetHeatStat = {
  name: string
  cases: number
  urgent?: number
  lat?: number
  lng?: number
  points?: StreetHeatPoint[]
}

export type StreetHeatPoint = {
  id: string
  label?: string
  name: string
  lat: number
  lng: number
  urgent?: boolean
  recorded?: boolean
  purok?: number | null
}

type StreetMapProps = {
  data?: StreetHeatStat[]
  title?: string
  description?: string
}

type MapPoint = {
  id: string
  label?: string
  name: string
  cases: number
  urgent: number
  lat: number
  lng: number
  recorded: boolean
  purok?: number | null
}

const purokColors: Record<number, string> = {
  1: "#d94a4a",
  2: "#b73737",
  3: "#2f8fb5",
  4: "#e05555",
  5: "#194c45",
  6: "#1f2432",
  7: "#c7a765",
  8: "#35262b",
  9: "#75b95d",
  10: "#2d2521",
  11: "#7fac9b",
}

const outline = "M5 58 L18 48 L30 39 L42 30 L51 28 L58 21 L69 5 L79 2 L88 10 L92 28 L91 45 L98 59 L92 70 L82 74 L72 89 L45 88 L30 82 L16 77 L4 70 Z"

function heatLevel(cases: number, maxCases: number) {
  if (!cases) return { label: "No cases", color: "#94a3b8", radius: 3, opacity: 0.45 }

  const pct = cases / Math.max(maxCases, 1)
  if (pct >= 0.8) return { label: "Critical", color: "#ef4444", radius: 8, opacity: 0.86 }
  if (pct >= 0.55) return { label: "High", color: "#f97316", radius: 7, opacity: 0.78 }
  if (pct >= 0.3) return { label: "Moderate", color: "#facc15", radius: 6, opacity: 0.72 }
  return { label: "Low", color: "#22c55e", radius: 5, opacity: 0.68 }
}

export function StreetMap({
  data = [],
  title = "Street Incident Heatmap",
  description = `${EAST_TAPINAC_BARANGAY} - cases by street and purok`,
}: StreetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading")

  const statsByStreet = useMemo(() => {
    const next = new Map<string, { cases: number; urgent: number }>()

    data.forEach((item) => {
      const key = normalizeStreetName(item.name)
      const current = next.get(key) ?? { cases: 0, urgent: 0 }
      current.cases += item.cases
      current.urgent += item.urgent ?? 0
      next.set(key, current)
    })

    return next
  }, [data])

  const maxCases = useMemo(
    () => Math.max(...[...statsByStreet.values()].map((item) => item.cases), 1),
    [statsByStreet]
  )

  const ranked = useMemo(
    () =>
      [...statsByStreet.entries()]
        .map(([name, value]) => ({
          name,
          ...value,
        }))
        .sort((left, right) => right.cases - left.cases)
        .slice(0, 5),
    [statsByStreet]
  )

  const mapPoints = useMemo(
    () => {
      const recordedPoints = data.flatMap((item) =>
        (item.points ?? []).map((point) => ({
          id: point.id,
          label: point.label,
          name: point.name,
          cases: 1,
          urgent: point.urgent ? 1 : 0,
          lat: point.lat,
          lng: point.lng,
          recorded: point.recorded ?? true,
          purok: point.purok,
        } satisfies MapPoint))
      )

      if (recordedPoints.length > 0) {
        const grouped = new Map<string, MapPoint>()

        recordedPoints.forEach((point) => {
          const key = `${point.lat.toFixed(6)}:${point.lng.toFixed(6)}:${point.name}`
          const current = grouped.get(key)

          if (!current) {
            grouped.set(key, point)
            return
          }

          current.cases += 1
          current.urgent += point.urgent
          current.label = `${current.cases} reports`
        })

        return [...grouped.values()]
      }

      const customPoints = data.reduce<MapPoint[]>((points, item) => {
          const street = findEastTapinacStreet(item.name)
          const lat = item.lat ?? street?.lat
          const lng = item.lng ?? street?.lng

          if (!lat || !lng) return points

          points.push({
            id: normalizeStreetName(item.name),
            name: item.name,
            cases: item.cases,
            urgent: item.urgent ?? 0,
            lat,
            lng,
            recorded: Boolean(item.lat && item.lng),
            purok: street?.purok,
          })

          return points
        }, [])

      return customPoints
    },
    [data],
  )

  useEffect(() => {
    if (!mapRef.current) return

    let cancelled = false
    let map: LeafletMap | null = null
    let layers: Layer[] = []
    setMapStatus("loading")

    import("leaflet")
      .then((leaflet) => {
        if (cancelled || !mapRef.current) return

        const L = leaflet.default ?? leaflet
        const barangayBounds = [
          [EAST_TAPINAC_BOUNDS.south, EAST_TAPINAC_BOUNDS.west],
          [EAST_TAPINAC_BOUNDS.north, EAST_TAPINAC_BOUNDS.east],
        ] satisfies LatLngBoundsExpression
        const pointBounds = mapPoints.map((point) => [point.lat, point.lng] satisfies LatLngExpression)

        const leafletMap = L.map(mapRef.current, {
          center: [EAST_TAPINAC_CENTER.latitude, EAST_TAPINAC_CENTER.longitude],
          zoom: 15,
          minZoom: 13,
          maxZoom: 19,
          zoomControl: false,
          scrollWheelZoom: true,
        })
        map = leafletMap

        L.control.zoom({ position: "bottomright" }).addTo(leafletMap)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(leafletMap)

        layers = []

        mapPoints.forEach((point) => {
          const level = heatLevel(point.cases, maxCases)
          const marker = L.circleMarker([point.lat, point.lng], {
            radius: point.cases ? level.radius + 7 : 4,
            color: "#ffffff",
            fillColor: level.color,
            fillOpacity: point.cases ? level.opacity : 0.38,
            opacity: point.cases ? 1 : 0.65,
            weight: point.cases ? 2 : 1,
          }).addTo(leafletMap)

          marker.bindPopup(
            `<strong>${point.label ?? point.name}</strong><br />${point.name}<br />Purok ${point.purok ?? "N/A"}<br />${point.cases} case${point.cases === 1 ? "" : "s"}${point.urgent ? `<br />${point.urgent} urgent` : ""}<br />${point.recorded ? "Recorded GPS location" : "Approximate street location"}`,
          )

          if (point.cases > 0) {
            marker.bindTooltip(String(point.cases), {
              permanent: true,
              direction: "center",
              className: "iris-leaflet-count",
            })
          }

          layers.push(marker)
        })

        leafletMap.fitBounds(pointBounds.length > 0 ? pointBounds : barangayBounds, { padding: [28, 28], maxZoom: 17 })
        window.setTimeout(() => map?.invalidateSize(), 80)
        setMapStatus("ready")
      })
      .catch(() => {
        if (!cancelled) setMapStatus("error")
      })

    return () => {
      cancelled = true
      layers.forEach((layer) => layer.remove())
      map?.remove()
    }
  }, [mapPoints, maxCases])

  return (
    <div className="flex h-full min-h-[300px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold leading-none tracking-tight">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
          {data.reduce((sum, item) => sum + item.cases, 0)} cases
        </span>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="relative min-h-[220px] overflow-hidden rounded-lg border border-border bg-[#d8ebe2]">
          {mapStatus !== "error" ? (
            <>
              <div ref={mapRef} className="h-full min-h-[220px] w-full" aria-label="OpenStreetMap incident heatmap" />
              {mapStatus === "loading" && (
                <div className="absolute inset-0 grid place-items-center bg-background/70 text-xs font-semibold text-muted-foreground">
                  Loading map
                </div>
              )}
            </>
          ) : (
          <svg viewBox="0 0 100 94" className="h-full w-full" role="img" aria-label="Barangay East Tapinac street heatmap">
            <path d={outline} fill="#f8fafc" stroke="#b91c1c" strokeDasharray="1.8 1.5" strokeWidth="0.45" />

            {EAST_TAPINAC_STREETS.map((street) => (
              <g key={`${street.id}-base`}>
                <circle
                  cx={street.mapX}
                  cy={street.mapY}
                  r="3.5"
                  fill={purokColors[street.purok]}
                  opacity="0.34"
                />
                <line
                  x1={street.mapX - 2.2}
                  y1={street.mapY}
                  x2={street.mapX + 2.2}
                  y2={street.mapY}
                  stroke="#ffffff"
                  strokeWidth="0.85"
                  strokeLinecap="round"
                />
              </g>
            ))}

            {EAST_TAPINAC_STREETS.map((street) => {
              const stat = statsByStreet.get(normalizeStreetName(street.name))
              const cases = stat?.cases ?? 0
              const level = heatLevel(cases, maxCases)

              return (
                <g key={street.id}>
                  <circle
                    cx={street.mapX}
                    cy={street.mapY}
                    r={level.radius + 3}
                    fill={level.color}
                    opacity={cases ? 0.16 : 0}
                  />
                  <circle
                    cx={street.mapX}
                    cy={street.mapY}
                    r={level.radius}
                    fill={level.color}
                    opacity={level.opacity}
                    stroke="#ffffff"
                    strokeWidth="0.65"
                  />
                  {cases > 0 && (
                    <text
                      x={street.mapX}
                      y={street.mapY + 1.4}
                      textAnchor="middle"
                      className="fill-white text-[3px] font-bold"
                    >
                      {cases}
                    </text>
                  )}
                  <title>{`${street.name}, Purok ${street.purok}: ${cases} case${cases === 1 ? "" : "s"} (${level.label})`}</title>
                </g>
              )
            })}
          </svg>
          )}

          <div className="absolute left-3 top-3 rounded-lg border border-white/60 bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
            {mapStatus === "error" ? "Map fallback active" : "OpenStreetMap heatmap"}
          </div>
        </div>

        <aside className="min-h-0 rounded-lg border border-border bg-background/70 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Top Hotspots
          </div>

          <div className="mt-3 space-y-2">
            {ranked.length ? (
              ranked.map((item) => {
                const level = heatLevel(item.cases, maxCases)
                return (
                  <div key={item.name} className="rounded-lg border border-border bg-card px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold capitalize text-foreground">{item.name}</p>
                      <span className="text-xs font-bold text-foreground">{item.cases}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max((item.cases / maxCases) * 100, 8)}%`,
                          backgroundColor: level.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                No case locations have been recorded yet.
              </p>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] text-muted-foreground">
            {[
              ["#22c55e", "Low"],
              ["#facc15", "Moderate"],
              ["#f97316", "High"],
              ["#ef4444", "Critical"],
            ].map(([color, label]) => (
              <span key={label} className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: color }} />
                {label}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
