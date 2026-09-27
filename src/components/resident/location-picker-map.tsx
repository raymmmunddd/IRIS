"use client"

import { useMemo } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"
import { OLONGAPO_CITY_CENTER } from "@/lib/olongapo-location"

export type PickedLocation = {
  latitude: number
  longitude: number
}

type LocationPickerMapProps = {
  selectedLocation: PickedLocation | null
  onSelectLocation: (location: PickedLocation) => void
}

const pinIcon = L.divIcon({
  className: "resident-location-pin",
  html: '<span aria-hidden="true" style="display:block;width:30px;height:30px;border:3px solid white;border-radius:50% 50% 50% 0;background:#1d4ed8;transform:rotate(-45deg);box-shadow:0 2px 8px #0005"></span>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
})

function MapClickHandler({ onSelectLocation }: Pick<LocationPickerMapProps, "onSelectLocation">) {
  useMapEvents({
    click(event) {
      onSelectLocation({ latitude: event.latlng.lat, longitude: event.latlng.lng })
    },
  })
  return null
}

export function LocationPickerMap({ selectedLocation, onSelectLocation }: LocationPickerMapProps) {
  const selectedPoint = useMemo<[number, number] | null>(() => selectedLocation
    ? [selectedLocation.latitude, selectedLocation.longitude]
    : null,
  [selectedLocation])
  const center: [number, number] = selectedPoint ?? [OLONGAPO_CITY_CENTER.latitude, OLONGAPO_CITY_CENTER.longitude]

  return (
    <div className="relative z-0 h-72 overflow-hidden rounded-2xl border border-border sm:h-96">
      <MapContainer
        center={center}
        zoom={selectedPoint ? 16 : 15}
        scrollWheelZoom
        className="h-full w-full"
        aria-label="Choose incident location on map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onSelectLocation={onSelectLocation} />
        {selectedPoint && (
          <Marker
            position={selectedPoint}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend(event) {
                const point = (event.target as L.Marker).getLatLng()
                onSelectLocation({ latitude: point.lat, longitude: point.lng })
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}
