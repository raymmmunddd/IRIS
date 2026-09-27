export const OLONGAPO_CITY_CENTER = {
  latitude: 14.8389,
  longitude: 120.2844,
} as const

export const OLONGAPO_CITY_BOUNDS = {
  south: 14.8063302,
  west: 120.2331911,
  north: 14.9205209,
  east: 120.4180116,
} as const

export const OLONGAPO_BARANGAYS = [
  "Asinan",
  "Banicain",
  "Barretto",
  "East Bajac-bajac",
  "East Tapinac",
  "Gordon Heights",
  "Kalaklan",
  "New Kalalake",
  "Mabayuan",
  "New Cabalan",
  "New Ilalim",
  "New Kababae",
  "Old Cabalan",
  "Pag-asa",
  "Santa Rita",
  "West Bajac-bajac",
  "West Tapinac",
] as const

function normalizePlaceName(value: string) {
  return value
    .replace(/^barangay\s+/i, "")
    .split(",")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

export function matchOlongapoBarangay(values: Array<string | undefined>) {
  const names = new Set(values.filter((value): value is string => Boolean(value)).map(normalizePlaceName))
  return OLONGAPO_BARANGAYS.find((barangay) => names.has(normalizePlaceName(barangay))) ?? null
}

export function isWithinOlongapoCity(latitude: number, longitude: number) {
  return latitude >= OLONGAPO_CITY_BOUNDS.south
    && latitude <= OLONGAPO_CITY_BOUNDS.north
    && longitude >= OLONGAPO_CITY_BOUNDS.west
    && longitude <= OLONGAPO_CITY_BOUNDS.east
}
