"use client"

import { useMemo } from "react"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
)
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false },
)
const Tooltip = dynamic(
  () => import("react-leaflet").then((mod) => mod.Tooltip),
  { ssr: false },
)

const eastTapinacCenter: [number, number] = [14.8386, 120.2839]

const streets = [
  { id: 1, name: "Rizal Avenue", cases: 24, coords: [14.8394, 120.2829] as [number, number] },
  { id: 2, name: "Del Pilar Street", cases: 45, coords: [14.8401, 120.2844] as [number, number] },
  { id: 3, name: "Mabini Street", cases: 68, coords: [14.8388, 120.2855] as [number, number] },
  { id: 4, name: "Bonifacio Street", cases: 32, coords: [14.8377, 120.2832] as [number, number] },
  { id: 5, name: "Sampaguita Street", cases: 56, coords: [14.8379, 120.2850] as [number, number] },
  { id: 6, name: "Luna Street", cases: 12, coords: [14.8382, 120.2823] as [number, number] },
]

export function StreetMap() {
  const maxCases = useMemo(
    () => Math.max(...streets.map((street) => street.cases)),
    [],
  )

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold leading-none tracking-tight">Case Distribution Map</h3>
      <p className="text-sm text-muted-foreground mb-4">Barangay East Tapinac - Cases per street</p>

      <div className="relative z-0 h-[300px] overflow-hidden rounded-lg border border-border">
        <MapContainer
          center={eastTapinacCenter}
          zoom={16}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {streets.map((street) => (
            <CircleMarker
              key={street.id}
              center={street.coords}
              radius={6 + (street.cases / maxCases) * 12}
              pathOptions={{
                color: "#b45309",
                fillColor: "#f59e0b",
                fillOpacity: 0.75,
                weight: 1.5,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                <div className="text-xs font-medium">
                  {street.name}: {street.cases} cases
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
