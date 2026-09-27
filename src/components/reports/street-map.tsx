"use client"

import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"
import { MapPin } from "lucide-react"
import { OLONGAPO_CITY_CENTER } from "@/lib/olongapo-location"

const MapContainer = dynamic(
  () => import("react-leaflet").then((module) => module.MapContainer),
  { ssr: false },
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((module) => module.TileLayer),
  { ssr: false },
)
const CircleMarker = dynamic(
  () => import("react-leaflet").then((module) => module.CircleMarker),
  { ssr: false },
)
const Tooltip = dynamic(
  () => import("react-leaflet").then((module) => module.Tooltip),
  { ssr: false },
)

export type MapIncident = {
  id: string
  title: string
  street: string
  address: string
  latitude: number
  longitude: number
  accuracy: number | null
  priority: string
  status: string
}

type StreetMapProps = {
  incidents?: MapIncident[]
  title?: string
  description?: string
  className?: string
}

export function StreetMap({
  incidents = [],
  title = "Reported incident locations",
  description = "Olongapo City · markers use the latitude and longitude stored with each report",
  className = "",
}: StreetMapProps) {
  const mappedIncidents = incidents.filter((incident) =>
    Number.isFinite(incident.latitude)
    && Number.isFinite(incident.longitude)
    && incident.latitude >= -90
    && incident.latitude <= 90
    && incident.longitude >= -180
    && incident.longitude <= 180,
  )

  return (
    <section className={`flex h-full min-h-72 flex-col rounded-xl border border-border bg-card p-4 shadow-sm ${className}`}>
      <div className="mb-3">
        <h3 className="text-base font-semibold leading-none tracking-tight">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="relative z-0 min-h-64 flex-1 overflow-hidden rounded-lg border border-border">
        <MapContainer
          center={[OLONGAPO_CITY_CENTER.latitude, OLONGAPO_CITY_CENTER.longitude]}
          zoom={15}
          scrollWheelZoom={false}
          className="h-full min-h-64 w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mappedIncidents.map((incident) => (
            <CircleMarker
              key={incident.id}
              center={[incident.latitude, incident.longitude]}
              radius={7}
              pathOptions={{
                color: incident.priority === "Urgent" || incident.priority === "High" ? "#b91c1c" : "#1d4ed8",
                fillColor: incident.priority === "Urgent" || incident.priority === "High" ? "#ef4444" : "#3b82f6",
                fillOpacity: 0.75,
                weight: 1.5,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                <div className="max-w-56 text-xs">
                  <p className="font-semibold">{incident.title}</p>
                  <p>{incident.address || incident.street}</p>
                  <p>{incident.priority} · {incident.status}</p>
                  {incident.accuracy != null && <p>GPS accuracy: about {Math.round(incident.accuracy)} m</p>}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>

        {mappedIncidents.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
            <div className="flex max-w-sm items-center gap-3 rounded-xl border border-border bg-card/95 p-4 shadow-sm">
              <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No reports with verified coordinates are available to map yet.</p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {mappedIncidents.length} {mappedIncidents.length === 1 ? "report has" : "reports have"} verified coordinates. Reports without coordinates are not assigned an estimated street location.
      </p>
    </section>
  )
}
