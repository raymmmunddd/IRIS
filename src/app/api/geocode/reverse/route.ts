import { NextResponse } from "next/server"

import {
  describeEastTapinacLocation,
  findEastTapinacStreet,
  getNearestEastTapinacStreet,
  parseGeoCoordinate,
  resolveEastTapinacLocationFromAddress,
  type GeoPoint,
} from "@/lib/east-tapinac-geo"

type NominatimReverseResponse = {
  display_name?: string
  address?: {
    road?: string
    pedestrian?: string
    footway?: string
    path?: string
    residential?: string
    neighbourhood?: string
    suburb?: string
  }
}

function streetCandidate(data: NominatimReverseResponse) {
  return (
    data.address?.road ??
    data.address?.pedestrian ??
    data.address?.footway ??
    data.address?.path ??
    data.address?.residential ??
    data.display_name ??
    null
  )
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const latitude = parseGeoCoordinate(searchParams.get("lat"))
  const longitude = parseGeoCoordinate(searchParams.get("lng"))

  if (latitude === null || longitude === null) {
    return NextResponse.json({ success: false, message: "Latitude and longitude are required", data: null }, { status: 400 })
  }

  const point = { latitude, longitude } satisfies GeoPoint
  const nearestStreet = getNearestEastTapinacStreet(point)
  const fallback = {
    street: nearestStreet.name,
    purok: nearestStreet.purok,
    address: describeEastTapinacLocation(nearestStreet),
  }

  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(latitude),
      lon: String(longitude),
      addressdetails: "1",
      zoom: "18",
    })
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "IRIS-East-Tapinac/1.0",
      },
      next: { revalidate: 60 * 60 * 24 },
    })

    if (!response.ok) {
      return NextResponse.json({ success: true, message: "Fallback location resolved", data: fallback })
    }

    const data = await response.json() as NominatimReverseResponse
    const candidate = streetCandidate(data)
    const address = data.display_name ?? (candidate ? `${candidate}, East Tapinac, Olongapo City` : null)
    const resolved = resolveEastTapinacLocationFromAddress(point, address)
    const explicitStreet = findEastTapinacStreet(candidate)

    return NextResponse.json({
      success: true,
      message: "Location resolved",
      data: {
        street: explicitStreet?.name ?? resolved.street,
        purok: explicitStreet?.purok ?? resolved.purok,
        address: address ?? resolved.address,
      },
    })
  } catch (error) {
    console.error("Failed to reverse geocode location:", error)
    return NextResponse.json({ success: true, message: "Fallback location resolved", data: fallback })
  }
}
