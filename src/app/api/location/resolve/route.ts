import { NextResponse } from "next/server"
import { isWithinOlongapoCity, matchOlongapoBarangay } from "@/lib/olongapo-location"

type ResolvedLocation = {
  latitude: number
  longitude: number
  accuracy: number | null
  address: string
  street: string
  barangay: string
  city: "Olongapo City"
  provider: "OpenStreetMap Nominatim"
}

type NominatimResponse = {
  address?: Record<string, string | undefined>
}

type LocationCacheEntry = {
  expiresAt: number
  result: ResolvedLocation | null
}

type LocationProcessState = {
  cache: Map<string, LocationCacheEntry>
  providerQueue: Promise<void>
  nextProviderRequestAt: number
}

const globalForLocation = globalThis as typeof globalThis & {
  irisLocationProcessState?: LocationProcessState
}

const processState = globalForLocation.irisLocationProcessState ?? {
  cache: new Map<string, LocationCacheEntry>(),
  providerQueue: Promise.resolve(),
  nextProviderRequestAt: 0,
}
globalForLocation.irisLocationProcessState = processState

function response(success: boolean, message: string, data: ResolvedLocation | null, status = 200) {
  return NextResponse.json({ success, message, data }, { status })
}

function streetFromAddress(address: Record<string, string | undefined>) {
  const road = address.road ?? address.pedestrian ?? address.residential ?? address.path
  if (!road) return ""
  return [address.house_number, road].filter(Boolean).join(" ")
}

async function withNominatimLimit<T>(operation: () => Promise<T>) {
  const previous = processState.providerQueue
  let release: () => void = () => undefined
  processState.providerQueue = new Promise<void>((resolve) => {
    release = resolve
  })

  await previous
  try {
    const waitMs = processState.nextProviderRequestAt - Date.now()
    if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs))
    processState.nextProviderRequestAt = Date.now() + 1_100
    return await operation()
  } finally {
    release()
  }
}

async function resolveCoordinates(latitude: number, longitude: number) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse")
  url.searchParams.set("lat", String(latitude))
  url.searchParams.set("lon", String(longitude))
  url.searchParams.set("format", "jsonv2")
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("zoom", "18")
  url.searchParams.set("namedetails", "0")

  const contact = process.env.NOMINATIM_CONTACT_EMAIL
  const userAgent = `IRIS Incident Reporting System${contact ? ` (${contact})` : ""}`
  const providerResponse = await fetch(url, {
    headers: { "User-Agent": userAgent, Accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
    cache: "no-store",
  })
  if (!providerResponse.ok) throw new Error(`Location provider returned ${providerResponse.status}`)

  const result = await providerResponse.json() as NominatimResponse
  return result.address ?? {}
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== "object") {
      return response(false, "Enter valid coordinates or type your address manually.", null, 400)
    }

    const input = body as Record<string, unknown>
    const { latitude, longitude } = input
    if (typeof latitude !== "number" || !Number.isFinite(latitude) || latitude < -90 || latitude > 90
      || typeof longitude !== "number" || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return response(false, "Enter valid coordinates or type your address manually.", null, 400)
    }

    const accuracy = typeof input.accuracy === "number" && Number.isFinite(input.accuracy) && input.accuracy >= 0
      ? input.accuracy
      : null
    if (!isWithinOlongapoCity(latitude, longitude)) {
      return response(false, "We could not confirm this location in Olongapo City. Enter your address manually to continue.", null, 422)
    }

    const cacheKey = `${latitude.toFixed(5)},${longitude.toFixed(5)}`
    const cached = processState.cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result
        ? response(true, "Barangay-level location resolved", { ...cached.result, accuracy })
        : response(false, "We could not identify a barangay for these coordinates. Enter your address manually to continue.", null, 422)
    }

    const address = await withNominatimLimit(() => resolveCoordinates(latitude, longitude))
    const cityCandidates = [address.city, address.town, address.municipality, address.city_district]
    const isOlongapo = cityCandidates.some((candidate) => candidate?.toLowerCase().includes("olongapo"))
    const barangay = matchOlongapoBarangay([
      address.suburb,
      address.neighbourhood,
      address.city_district,
      address.quarter,
      address.village,
      address.hamlet,
      address.borough,
    ])

    if (!isOlongapo || !barangay) {
      processState.cache.set(cacheKey, { expiresAt: Date.now() + 60_000, result: null })
      return response(false, "We could not confirm a barangay-level address. Enter your barangay and street manually to continue.", null, 422)
    }

    const street = streetFromAddress(address)
    const addressParts = [street, `Barangay ${barangay}`, "Olongapo City", "Zambales", "Philippines"]
    const resolved: ResolvedLocation = {
      latitude,
      longitude,
      accuracy,
      address: addressParts.filter(Boolean).join(", "),
      street,
      barangay,
      city: "Olongapo City",
      provider: "OpenStreetMap Nominatim",
    }
    processState.cache.set(cacheKey, { expiresAt: Date.now() + 24 * 60 * 60 * 1_000, result: resolved })
    return response(true, "Barangay-level location resolved", resolved)
  } catch (error) {
    console.error("Failed to resolve location:", error)
    return response(false, "Location lookup is temporarily unavailable. Enter your address manually to continue.", null, 503)
  }
}
