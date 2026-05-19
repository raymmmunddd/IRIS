export const EAST_TAPINAC_BARANGAY = "Barangay East Tapinac" as const

export type EastTapinacStreet = {
  id: string
  name: string
  purok: number
  barangay: typeof EAST_TAPINAC_BARANGAY
  lat: number
  lng: number
  mapX: number
  mapY: number
}

export type GeoPoint = {
  latitude: number
  longitude: number
  accuracy?: number | null
}

export type ResolvedEastTapinacLocation = GeoPoint & {
  address: string
  street: string
  purok: number
}

export const EAST_TAPINAC_CENTER = {
  latitude: 14.8389,
  longitude: 120.2842,
}

export const EAST_TAPINAC_BOUNDS = {
  north: 14.8429,
  south: 14.8355,
  west: 120.2794,
  east: 120.2882,
}

export const EAST_TAPINAC_STREETS: EastTapinacStreet[] = [
  { id: "p11-rizal-extension", name: "Rizal Extension", purok: 11, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8374, lng: 120.2799, mapX: 8, mapY: 55 },
  { id: "p11-alba-st", name: "Alba Street", purok: 11, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8377, lng: 120.2806, mapX: 13, mapY: 59 },
  { id: "p11-3rd-st", name: "3rd Street", purok: 11, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8379, lng: 120.2812, mapX: 17, mapY: 64 },
  { id: "p11-5th-st", name: "5th Street", purok: 11, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8381, lng: 120.2818, mapX: 21, mapY: 68 },
  { id: "p11-fendler-st", name: "Fendler Street", purok: 11, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8372, lng: 120.2815, mapX: 16, mapY: 73 },
  { id: "p11-lindayag-st", name: "Lindayag Street", purok: 11, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8368, lng: 120.2820, mapX: 22, mapY: 78 },

  { id: "p8-rizal-avenue", name: "Rizal Avenue", purok: 8, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8396, lng: 120.2818, mapX: 28, mapY: 43 },
  { id: "p8-magsaysay-drive", name: "Magsaysay Drive", purok: 8, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8389, lng: 120.2824, mapX: 31, mapY: 56 },
  { id: "p8-bacon-st", name: "Bacon Street", purok: 8, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8382, lng: 120.2826, mapX: 32, mapY: 65 },
  { id: "p8-fendler-st", name: "Fendler Street", purok: 8, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8376, lng: 120.2828, mapX: 35, mapY: 72 },
  { id: "p8-east-9th-st", name: "East 9th Street", purok: 8, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8371, lng: 120.2830, mapX: 39, mapY: 78 },

  { id: "p5-rizal-avenue", name: "Rizal Avenue", purok: 5, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8401, lng: 120.2832, mapX: 43, mapY: 32 },
  { id: "p5-veterano-st", name: "Veterano Street", purok: 5, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8394, lng: 120.2834, mapX: 45, mapY: 41 },
  { id: "p5-bacon-st", name: "Bacon Street", purok: 5, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8388, lng: 120.2835, mapX: 48, mapY: 50 },
  { id: "p5-east-14th-st", name: "East 14th Street", purok: 5, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8380, lng: 120.2838, mapX: 52, mapY: 62 },
  { id: "p5-east-13th-st", name: "East 13th Street", purok: 5, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8373, lng: 120.2839, mapX: 54, mapY: 72 },
  { id: "p5-11th-st", name: "11th Street", purok: 5, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8391, lng: 120.2841, mapX: 54, mapY: 43 },

  { id: "p6-donor-st", name: "Donor Street", purok: 6, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8384, lng: 120.2847, mapX: 60, mapY: 53 },
  { id: "p6-llanos-st", name: "Llanos Street", purok: 6, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8380, lng: 120.2850, mapX: 64, mapY: 60 },
  { id: "p6-east-12th-st", name: "East 12th Street", purok: 6, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8374, lng: 120.2852, mapX: 66, mapY: 69 },
  { id: "p6-fendler-st", name: "Fendler Street", purok: 6, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8370, lng: 120.2854, mapX: 68, mapY: 77 },
  { id: "p6-east-14th-st", name: "East 14th Street", purok: 6, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8387, lng: 120.2853, mapX: 66, mapY: 45 },
  { id: "p6-east-13th-st", name: "East 13th Street", purok: 6, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8381, lng: 120.2856, mapX: 70, mapY: 55 },

  { id: "p9-fendler-st", name: "Fendler Street", purok: 9, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8365, lng: 120.2841, mapX: 50, mapY: 85 },
  { id: "p9-gallagher-st", name: "Gallagher Street", purok: 9, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8366, lng: 120.2848, mapX: 58, mapY: 85 },
  { id: "p9-hansen-st", name: "Hansen Street", purok: 9, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8366, lng: 120.2855, mapX: 66, mapY: 87 },
  { id: "p9-irving-st", name: "Irving Street", purok: 9, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8365, lng: 120.2862, mapX: 75, mapY: 88 },
  { id: "p9-east-12th-st", name: "East 12th Street", purok: 9, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8371, lng: 120.2860, mapX: 75, mapY: 79 },
  { id: "p9-east-10th-st", name: "East 10th Street", purok: 9, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8375, lng: 120.2864, mapX: 81, mapY: 72 },

  { id: "p7-fendler-st", name: "Fendler Street", purok: 7, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8373, lng: 120.2860, mapX: 77, mapY: 69 },
  { id: "p7-gallagher-st", name: "Gallagher Street", purok: 7, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8370, lng: 120.2865, mapX: 82, mapY: 76 },
  { id: "p7-hansen-st", name: "Hansen Street", purok: 7, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8368, lng: 120.2871, mapX: 88, mapY: 82 },
  { id: "p7-irving-st", name: "Irving Street", purok: 7, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8365, lng: 120.2875, mapX: 91, mapY: 88 },
  { id: "p7-east-14th-st", name: "East 14th Street", purok: 7, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8380, lng: 120.2865, mapX: 80, mapY: 62 },
  { id: "p7-east-12th-st", name: "East 12th Street", purok: 7, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8376, lng: 120.2871, mapX: 86, mapY: 70 },

  { id: "p10-fendler-st", name: "Fendler Street", purok: 10, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8380, lng: 120.2867, mapX: 82, mapY: 57 },
  { id: "p10-east-10th-st", name: "East 10th Street", purok: 10, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8382, lng: 120.2872, mapX: 87, mapY: 61 },
  { id: "p10-east-8th-st", name: "East 8th Street", purok: 10, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8384, lng: 120.2877, mapX: 91, mapY: 64 },
  { id: "p10-east-6th-st", name: "East 6th Street", purok: 10, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8386, lng: 120.2880, mapX: 94, mapY: 68 },
  { id: "p10-magsaysay-drive", name: "Magsaysay Drive", purok: 10, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8386, lng: 120.2865, mapX: 78, mapY: 51 },

  { id: "p4-apelado-st", name: "Apelado Street", purok: 4, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8392, lng: 120.2853, mapX: 66, mapY: 34 },
  { id: "p4-east-14th-st", name: "East 14th Street", purok: 4, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8390, lng: 120.2860, mapX: 73, mapY: 41 },
  { id: "p4-fontaine-extension", name: "Fontaine Extension", purok: 4, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8391, lng: 120.2865, mapX: 79, mapY: 44 },

  { id: "p2-labrador-st", name: "Labrador Street", purok: 2, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8396, lng: 120.2867, mapX: 83, mapY: 36 },
  { id: "p2-rizal-st", name: "Rizal Street", purok: 2, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8401, lng: 120.2869, mapX: 86, mapY: 30 },
  { id: "p2-fontaine-extension", name: "Fontaine Extension", purok: 2, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8405, lng: 120.2864, mapX: 80, mapY: 26 },

  { id: "p3-hospital-road", name: "Hospital Road", purok: 3, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8414, lng: 120.2867, mapX: 83, mapY: 13 },
  { id: "p3-dela-cruz-drive", name: "Dela Cruz Drive", purok: 3, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8420, lng: 120.2858, mapX: 73, mapY: 9 },
  { id: "p3-fontaine-bridge", name: "Fontaine Bridge", purok: 3, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8408, lng: 120.2874, mapX: 91, mapY: 21 },

  { id: "p1-gallagher-st", name: "Gallagher Street", purok: 1, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8387, lng: 120.2870, mapX: 86, mapY: 48 },
  { id: "p1-hansen-st", name: "Hansen Street", purok: 1, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8384, lng: 120.2875, mapX: 91, mapY: 52 },
  { id: "p1-irving-st", name: "Irving Street", purok: 1, barangay: EAST_TAPINAC_BARANGAY, lat: 14.8380, lng: 120.2880, mapX: 94, mapY: 58 },
]

export function normalizeStreetName(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/\bst\.?\b/g, "street")
    .replace(/\s+/g, " ")
    .trim()
}

export function parseGeoCoordinate(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function isWithinEastTapinac(point: GeoPoint) {
  return (
    point.latitude >= EAST_TAPINAC_BOUNDS.south &&
    point.latitude <= EAST_TAPINAC_BOUNDS.north &&
    point.longitude >= EAST_TAPINAC_BOUNDS.west &&
    point.longitude <= EAST_TAPINAC_BOUNDS.east
  )
}

function distanceSquared(point: GeoPoint, street: EastTapinacStreet) {
  const lat = point.latitude - street.lat
  const lng = point.longitude - street.lng
  return lat * lat + lng * lng
}

export function findEastTapinacStreet(value: string | null | undefined) {
  const normalized = normalizeStreetName(value)
  if (!normalized) return null

  return (
    EAST_TAPINAC_STREETS.find((street) => normalizeStreetName(street.name) === normalized) ??
    EAST_TAPINAC_STREETS.find((street) => normalized.includes(normalizeStreetName(street.name))) ??
    EAST_TAPINAC_STREETS.find((street) => normalizeStreetName(street.name).includes(normalized)) ??
    null
  )
}

export function getNearestEastTapinacStreet(point: GeoPoint) {
  return [...EAST_TAPINAC_STREETS].sort(
    (left, right) => distanceSquared(point, left) - distanceSquared(point, right)
  )[0]
}

export function describeEastTapinacLocation(street: EastTapinacStreet | null | undefined) {
  if (!street) return EAST_TAPINAC_BARANGAY
  return `${street.name}, Purok ${street.purok}, ${EAST_TAPINAC_BARANGAY}`
}

export function resolveEastTapinacLocationFromAddress(
  point: GeoPoint,
  address: string | null | undefined
): ResolvedEastTapinacLocation {
  const nearestStreet = getNearestEastTapinacStreet(point)
  const addressStreet = findEastTapinacStreet(address)
  const street = addressStreet ?? nearestStreet

  return {
    ...point,
    street: street.name,
    purok: street.purok,
    address: address?.trim() || describeEastTapinacLocation(street),
  }
}

export async function resolveEastTapinacLocation(point: GeoPoint): Promise<ResolvedEastTapinacLocation> {
  const fallback = resolveEastTapinacLocationFromAddress(point, null)

  try {
    const params = new URLSearchParams({
      lat: String(point.latitude),
      lng: String(point.longitude),
    })
    const response = await fetch(`/api/geocode/reverse?${params.toString()}`, {
      cache: "no-store",
    })

    if (!response.ok) return fallback

    const result = await response.json() as {
      success?: boolean
      data?: Partial<ResolvedEastTapinacLocation>
    }

    if (!result.success || !result.data?.street) return fallback

    return {
      ...point,
      street: result.data.street,
      purok: result.data.purok ?? fallback.purok,
      address: result.data.address?.trim() || fallback.address,
    }
  } catch {
    return fallback
  }
}
